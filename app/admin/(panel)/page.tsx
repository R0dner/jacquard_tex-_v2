"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shirt, Boxes, ClipboardList, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

type Dashboard = {
  totalProductos: number;
  stockTotal: number;
  pedidosPendientes: number;
  stockBajo: { sku: string; stockActual: number; stockMinimo: number; productoId: number; etiqueta: string }[];
  seriesVentas: { fecha: string; total: number }[];
  topProductos: { nombre: string; cantidad: number }[];
  pedidosPorEstado: { estado: string; cantidad: number }[];
  movimientosRecientes: { id: number; tipo: string; motivo: string | null; fecha: string; registradoPor: string }[];
};

const COLOR_ESTADO: Record<string, string> = {
  PENDIENTE: "#C97C2C",
  CONFIRMADO: "#3B6EA5",
  ENVIADO: "#2F6E5B",
  ENTREGADO: "#1C2333",
  CANCELADO: "#B84A3E",
};

function KpiCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
      <div className="h-1" style={{ background: accent }} />
      <div className="p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}1A`, color: accent }}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold font-mono-data leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const sinPermiso = searchParams.get("sinPermiso");
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="p-8 text-gray-400">Cargando...</p>;

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {sinPermiso && (
        <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md">
          No tienes permiso para acceder a esa sección.
        </p>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium">Panel general</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen de la operación</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/productos/nuevo" className="flex items-center gap-1.5 text-sm bg-[var(--color-ink)] text-white rounded-md px-4 py-2 hover:bg-[var(--color-ink-light)] transition-colors">
            <Plus size={16} /> Producto
          </Link>
          <Link href="/admin/pedidos/nuevo" className="flex items-center gap-1.5 text-sm border border-[var(--color-line)] rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
            <Plus size={16} /> Pedido
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <KpiCard icon={Shirt} label="Productos activos" value={data.totalProductos} accent="#2F6E5B" />
        <KpiCard icon={Boxes} label="Unidades en stock" value={data.stockTotal} accent="#3B6EA5" />
        <KpiCard icon={ClipboardList} label="Pedidos pendientes" value={data.pedidosPendientes} accent="#C97C2C" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-[var(--color-accent)]" /> Ventas — últimos 30 días
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.seriesVentas}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="fecha" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="var(--color-accent)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Pedidos por estado</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.pedidosPorEstado} dataKey="cantidad" nameKey="estado" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {data.pedidosPorEstado.map((p) => (
                  <Cell key={p.estado} fill={COLOR_ESTADO[p.estado] ?? "#999"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {data.pedidosPorEstado.map((p) => (
              <span key={p.estado} className="text-xs flex items-center gap-1 text-gray-500">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLOR_ESTADO[p.estado] ?? "#999" }} />
                {p.estado.toLowerCase()} ({p.cantidad})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Productos más vendidos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.topProductos} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke="var(--color-line)" horizontal={false} />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="nombre" type="category" fontSize={11} width={90} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Stock bajo</h2>
          {data.stockBajo.length === 0 ? (
            <p className="text-sm text-gray-400">Nada por debajo del mínimo.</p>
          ) : (
            <div className="space-y-3">
              {data.stockBajo.map((v) => {
                const porcentaje = v.stockMinimo > 0 ? Math.min(100, (v.stockActual / v.stockMinimo) * 100) : 0;
                return (
                  <div key={v.sku}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{v.etiqueta}</span>
                      <span className="font-mono-data text-[var(--color-warning)]">{v.stockActual}/{v.stockMinimo}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-warning-light)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-warning)] rounded-full" style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Movimientos recientes</h2>
        <table className="w-full text-sm">
          <tbody>
            {data.movimientosRecientes.map((m) => (
              <tr key={m.id} className="border-b border-[var(--color-line)] last:border-0">
                <td className={`py-2 ${m.tipo === "ENTRADA" ? "text-[var(--color-accent)]" : "text-[var(--color-danger)]"}`}>
                  {m.tipo === "ENTRADA" ? "↑" : "↓"} {m.motivo ?? m.tipo}
                </td>
                <td className="py-2 text-gray-500 text-xs text-right">{m.registradoPor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}