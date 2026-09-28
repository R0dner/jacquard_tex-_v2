"use client";
import { useEffect, useState } from "react";
import { Download, ShieldAlert, ChevronDown, TrendingUp, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Package } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Pedido = {
  id: number; referencia: string; total: string; fechaPedido: string; estado: string;
  cliente: { nombre: string | null } | null; nombreInvitado: string | null;
};
type ReporteVentas = {
  porUsuario: Record<string, { nombre: string; pedidos: Pedido[]; total: number }>;
  totalGeneral: number;
  error?: string;
};
type ItemInventario = {
  sku: string; producto: string; color: string | null; talla: string | null;
  stockActual: number; stockMinimo: number; bajoMinimo: boolean; valorCosto: number; valorVenta: number;
};
type ReporteInventario = {
  detalle: ItemInventario[];
  totales: { unidadesTotales: number; valorCostoTotal: number; valorVentaTotal: number; variantesBajoMinimo: number };
  movimientosPeriodo: { entradasCantidad: number; entradasCosto: number; salidasCantidad: number };
  error?: string;
};
type Usuario = { id: number; nombre: string };

export default function ReportesPage() {
  const [tab, setTab] = useState<"ventas" | "inventario">("ventas");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  const [reporteVentas, setReporteVentas] = useState<ReporteVentas | null>(null);
  const [reporteInventario, setReporteInventario] = useState<ReporteInventario | null>(null);

  useEffect(() => {
    fetch("/api/usuarios").then((r) => r.json()).then(setUsuarios);
  }, []);

  function cargarVentas() {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    if (usuarioId) params.set("usuarioId", usuarioId);
    fetch(`/api/reportes/ventas?${params}`).then((r) => r.json()).then(setReporteVentas);
  }

  function cargarInventario() {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    fetch(`/api/reportes/inventario?${params}`).then((r) => r.json()).then(setReporteInventario);
  }

  useEffect(() => {
    if (tab === "ventas") cargarVentas();
    else cargarInventario();
  }, [tab]);

  function exportarVentasPDF() {
    if (!reporteVentas || reporteVentas.error) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de ventas — Jacquard Tex", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generado el ${new Date().toLocaleDateString()}${desde ? ` — Desde ${desde}` : ""}${hasta ? ` hasta ${hasta}` : ""}`, 14, 25);

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(`Total del periodo: Bs ${reporteVentas.totalGeneral.toFixed(2)}`, 14, 34);

    let y = 42;
    Object.values(reporteVentas.porUsuario).forEach((u) => {
      doc.setFontSize(12);
      doc.text(`${u.nombre} — Bs ${u.total.toFixed(2)} (${u.pedidos.length} pedidos)`, 14, y);

      autoTable(doc, {
        startY: y + 4,
        head: [["Referencia", "Cliente", "Fecha", "Total"]],
        body: u.pedidos.map((p) => [
          p.referencia,
          p.cliente?.nombre ?? p.nombreInvitado ?? "—",
          new Date(p.fechaPedido).toLocaleDateString(),
          `Bs ${Number(p.total).toFixed(2)}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [28, 35, 51] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      });

      y = (doc as any).lastAutoTable.finalY + 12;
    });

    doc.save(`reporte-ventas-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function exportarInventarioPDF() {
    if (!reporteInventario || reporteInventario.error) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Estado de inventario — Jacquard Tex", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generado el ${new Date().toLocaleDateString()}`, 14, 25);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Unidades en stock: ${reporteInventario.totales.unidadesTotales}`, 14, 34);
    doc.text(`Valor a costo: Bs ${reporteInventario.totales.valorCostoTotal.toFixed(2)}`, 14, 40);
    doc.text(`Valor a venta: Bs ${reporteInventario.totales.valorVentaTotal.toFixed(2)}`, 14, 46);
    doc.text(
      `Entradas del periodo: ${reporteInventario.movimientosPeriodo.entradasCantidad} u. (Bs ${reporteInventario.movimientosPeriodo.entradasCosto.toFixed(2)})  ·  Salidas: ${reporteInventario.movimientosPeriodo.salidasCantidad} u.`,
      14, 52
    );

    autoTable(doc, {
      startY: 60,
      head: [["Producto", "Stock", "Mínimo", "Valor costo", "Valor venta"]],
      body: reporteInventario.detalle.map((v) => [
        `${v.producto} ${v.color ?? ""} ${v.talla ?? ""}`,
        String(v.stockActual),
        String(v.stockMinimo),
        `Bs ${v.valorCosto.toFixed(2)}`,
        `Bs ${v.valorVenta.toFixed(2)}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [28, 35, 51] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const fila = reporteInventario.detalle[data.row.index];
          if (fila?.bajoMinimo) data.cell.styles.textColor = [201, 124, 44];
        }
      },
    });

    doc.save(`reporte-inventario-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const sinAcceso = reporteVentas?.error || reporteInventario?.error;
  if (sinAcceso) {
    return (
      <div className="p-8 max-w-md mx-auto text-center py-24">
        <ShieldAlert size={40} className="mx-auto mb-4 text-[var(--color-danger)]" />
        <h1 className="font-display text-2xl font-medium mb-2">Acceso restringido</h1>
        <p className="text-gray-500 text-sm">Este reporte solo está disponible para el administrador principal.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-medium">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">Ventas por vendedor y estado del inventario</p>
        </div>
        <button
          onClick={tab === "ventas" ? exportarVentasPDF : exportarInventarioPDF}
          className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors"
        >
          <Download size={16} /> Exportar PDF
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[var(--color-line)]">
        <button
          onClick={() => setTab("ventas")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "ventas" ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-gray-400"}`}
        >
          Ventas por vendedor
        </button>
        <button
          onClick={() => setTab("inventario")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "inventario" ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-gray-400"}`}
        >
          Estado de inventario
        </button>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5 mb-6 flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Desde</label>
          <input type="date" className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Hasta</label>
          <input type="date" className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        {tab === "ventas" && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Vendedor</label>
            <select className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
              <option value="">Todos</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
        )}
        <button onClick={tab === "ventas" ? cargarVentas : cargarInventario} className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-md text-sm font-medium">
          Filtrar
        </button>
      </div>

      {tab === "ventas" && reporteVentas && (
        <>
          <div className="bg-[var(--color-ink)] text-white rounded-lg p-5 mb-6 flex items-center gap-3">
            <TrendingUp size={20} className="text-[var(--color-gold)]" />
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide">Total del periodo</p>
              <p className="text-2xl font-bold font-mono-data">Bs {reporteVentas.totalGeneral.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(reporteVentas.porUsuario).map(([key, u]) => (
              <div key={key} className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
                <button onClick={() => setExpandido(expandido === key ? null : key)} className="w-full flex justify-between items-center p-5 hover:bg-[var(--color-bg)] transition-colors">
                  <div className="text-left">
                    <p className="font-semibold">{u.nombre}</p>
                    <p className="text-xs text-gray-400">{u.pedidos.length} pedidos</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono-data font-bold text-lg">Bs {u.total.toFixed(2)}</span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandido === key ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {expandido === key && (
                  <div className="border-t border-[var(--color-line)] p-5 space-y-2">
                    {u.pedidos.map((p) => (
                      <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-[var(--color-line)] last:border-0">
                        <span className="font-mono-data text-gray-500">{p.referencia}</span>
                        <span className="text-gray-600">{p.cliente?.nombre ?? p.nombreInvitado}</span>
                        <span className="font-mono-data font-medium">Bs {Number(p.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "inventario" && reporteInventario && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unidades en stock</p>
              <p className="text-2xl font-bold font-mono-data">{reporteInventario.totales.unidadesTotales}</p>
            </div>
            <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valor a costo</p>
              <p className="text-2xl font-bold font-mono-data">Bs {reporteInventario.totales.valorCostoTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valor a venta</p>
              <p className="text-2xl font-bold font-mono-data text-[var(--color-accent)]">Bs {reporteInventario.totales.valorVentaTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5 flex items-center gap-3">
              <ArrowUpCircle size={20} className="text-[var(--color-accent)]" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Entradas del periodo</p>
                <p className="font-mono-data font-semibold">{reporteInventario.movimientosPeriodo.entradasCantidad} unidades — Bs {reporteInventario.movimientosPeriodo.entradasCosto.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5 flex items-center gap-3">
              <ArrowDownCircle size={20} className="text-[var(--color-danger)]" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Salidas del periodo</p>
                <p className="font-mono-data font-semibold">{reporteInventario.movimientosPeriodo.salidasCantidad} unidades</p>
              </div>
            </div>
          </div>

          {reporteInventario.totales.variantesBajoMinimo > 0 && (
            <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertTriangle size={18} className="text-[var(--color-warning)]" />
              <p className="text-sm font-medium text-[var(--color-warning)]">{reporteInventario.totales.variantesBajoMinimo} variantes por debajo del stock mínimo</p>
            </div>
          )}

          <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-[var(--color-bg)] border-b border-[var(--color-line)] text-xs text-gray-600 uppercase tracking-wide">
                  <th className="p-3 font-semibold">Producto</th>
                  <th className="p-3 font-semibold">Stock</th>
                  <th className="p-3 font-semibold">Valor costo</th>
                  <th className="p-3 font-semibold">Valor venta</th>
                </tr>
              </thead>
              <tbody>
                {reporteInventario.detalle.map((v) => (
                  <tr key={v.sku} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-300" />
                        {v.producto} {v.color} {v.talla}
                      </div>
                    </td>
                    <td className={`p-3 font-mono-data ${v.bajoMinimo ? "text-[var(--color-warning)] font-semibold" : ""}`}>{v.stockActual}</td>
                    <td className="p-3 font-mono-data text-gray-500">Bs {v.valorCosto.toFixed(2)}</td>
                    <td className="p-3 font-mono-data">Bs {v.valorVenta.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}