"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Boxes, ArrowUpCircle, ArrowDownCircle, ChevronDown, AlertTriangle, Trash2, Search } from "lucide-react";

type Movimiento = {
  id: number;
  tipo: "ENTRADA" | "SALIDA";
  motivo: string | null;
  numeroDocumento: string | null;
  fecha: string;
  totalItems: number;
  totalCosto: string | null;
  registradoPor: { nombre: string } | null;
  items: {
    cantidad: number;
    variante: {
      sku: string;
      producto: { nombre: string };
      color: { nombre: string } | null;
      talla: { sigla: string } | null;
    };
  }[];
};

type StockItem = {
  sku: string;
  producto: string;
  color: string | null;
  talla: string | null;
  stockActual: number;
  stockMinimo: number;
};

export default function InventarioPage() {
  const [tab, setTab] = useState<"historial" | "stock">("historial");

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [stockBajo, setStockBajo] = useState<any[]>([]);

  const [stockActual, setStockActual] = useState<StockItem[]>([]);
  const [busqueda, setBusqueda] = useState("");

  function cargar() {
    fetch("/api/movimientos").then((r) => r.json()).then((data) => {
      setMovimientos(data);
      setCargando(false);
    });
    fetch("/api/dashboard").then((r) => r.json()).then((d) => setStockBajo(d.stockBajo ?? []));
    fetch("/api/inventario/stock-actual").then((r) => r.json()).then(setStockActual);
  }
  useEffect(cargar, []);

  async function borrarMovimiento(id: number) {
    if (!confirm("¿Borrar este movimiento? Se revertirá el stock que afectó.")) return;
    const res = await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
    if (!res.ok) return alert((await res.json()).error);
    cargar();
  }

  const stockFiltrado = stockActual.filter((v) => {
    const texto = `${v.producto} ${v.color ?? ""} ${v.talla ?? ""} ${v.sku}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-medium">Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">Historial y disponibilidad actual</p>
        </div>
        <Link href="/admin/inventario/nuevo" className="flex items-center gap-1.5 text-sm bg-[var(--color-ink)] text-white rounded-md px-4 py-2.5 hover:bg-[var(--color-ink-light)] transition-colors">
          <Plus size={16} /> Nuevo movimiento
        </Link>
      </div>

      {stockBajo.length > 0 && (
        <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-[var(--color-warning)]">{stockBajo.length} variantes con stock bajo</p>
          </div>
          <ul className="mt-2 ml-7 space-y-1">
            {stockBajo.map((v: any) => (
              <li key={v.sku} className="text-xs flex items-center justify-between max-w-md">
                <span className="text-gray-600">
                  {v.etiqueta} — <span className="font-mono-data">{v.stockActual}/{v.stockMinimo}</span>
                </span>
                <Link href={`/admin/inventario/nuevo?sku=${v.sku}`} className="text-[var(--color-warning)] font-medium hover:underline ml-2 whitespace-nowrap">
                  Reponer →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-[var(--color-line)]">
        <button
          onClick={() => setTab("historial")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "historial" ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-gray-400"}`}
        >
          Historial
        </button>
        <button
          onClick={() => setTab("stock")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "stock" ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-gray-400"}`}
        >
          Stock actual
        </button>
      </div>

      {tab === "historial" && (
        <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
          {cargando ? (
            <p className="p-8 text-sm text-gray-400 text-center">Cargando...</p>
          ) : movimientos.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Boxes size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Todavía no hay movimientos.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-[var(--color-bg)] border-b border-[var(--color-line)] text-xs text-gray-600 uppercase tracking-wide">
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Motivo</th>
                  <th className="p-4 font-semibold">Ítems</th>
                  <th className="p-4 font-semibold">Registrado por</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, i) => (
                  <>
                    <tr key={`fila-${m.id}`} className={`border-b border-[var(--color-line)] last:border-0 ${i % 2 === 1 ? "bg-[var(--color-bg)]/50" : ""}`}>
                      <td className="p-4 text-gray-500">{new Date(m.fecha).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
                          style={
                            m.tipo === "ENTRADA"
                              ? { background: "var(--color-accent-light)", color: "var(--color-accent)" }
                              : { background: "var(--color-danger-light)", color: "var(--color-danger)" }
                          }
                        >
                          {m.tipo === "ENTRADA" ? <ArrowUpCircle size={13} /> : <ArrowDownCircle size={13} />}
                          {m.tipo}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{m.motivo ?? "—"}</td>
                      <td className="p-4 font-mono-data">{m.totalItems}</td>
                      <td className="p-4 text-gray-600">{m.registradoPor?.nombre ?? "—"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 justify-end">
                          <button
                            onClick={() => setExpandido(expandido === m.id ? null : m.id)}
                            className="flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium"
                          >
                            Detalle <ChevronDown size={14} className={`transition-transform ${expandido === m.id ? "rotate-180" : ""}`} />
                          </button>
                          <button onClick={() => borrarMovimiento(m.id)} className="text-gray-400 hover:text-[var(--color-danger)]">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandido === m.id && (
                      <tr key={`detalle-${m.id}`}>
                        <td colSpan={6} className="p-4 bg-[var(--color-bg)] border-b border-[var(--color-line)]">
                          <ul className="space-y-1.5 text-sm">
                            {m.items.map((it, idx) => (
                              <li key={idx} className="flex justify-between max-w-md">
                                <span>{it.variante.producto.nombre} — {it.variante.color?.nombre} {it.variante.talla?.sigla}</span>
                                <span className="font-mono-data font-semibold">{it.cantidad}</span>
                              </li>
                            ))}
                          </ul>
                          {m.totalCosto && <p className="mt-2 text-sm font-medium text-gray-600">Costo total: Bs {m.totalCosto}</p>}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "stock" && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="border border-[var(--color-line)] rounded-md pl-9 pr-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
              placeholder="Buscar por producto, color, talla o SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-[var(--color-bg)] border-b border-[var(--color-line)] text-xs text-gray-600 uppercase tracking-wide">
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Color</th>
                  <th className="p-4 font-semibold">Talla</th>
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {stockFiltrado.map((v, i) => {
                  const bajo = v.stockActual <= v.stockMinimo;
                  return (
                    <tr key={v.sku} className={`border-b border-[var(--color-line)] last:border-0 ${i % 2 === 1 ? "bg-[var(--color-bg)]/50" : ""}`}>
                      <td className="p-4 font-medium">{v.producto}</td>
                      <td className="p-4 text-gray-600">{v.color ?? "—"}</td>
                      <td className="p-4 text-gray-600">{v.talla ?? "—"}</td>
                      <td className="p-4 font-mono-data text-gray-500 text-xs">{v.sku}</td>
                      <td className="p-4">
                        <span
                          className={`font-mono-data px-2.5 py-1 rounded-md text-sm font-semibold ${
                            v.stockActual === 0
                              ? "bg-[var(--color-danger-light)] text-[var(--color-danger)]"
                              : bajo
                              ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                              : "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                          }`}
                        >
                          {v.stockActual}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {stockFiltrado.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">No se encontró nada con esa búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}