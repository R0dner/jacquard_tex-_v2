"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, ClipboardList, Check, X, Truck, PackageCheck, Receipt } from "lucide-react";
import { tienePermiso } from "@/lib/permisos";

type Pedido = {
  id: number;
  referencia: string;
  nombreInvitado: string | null;
  estado: string;
  total: string;
  metodoPago: string | null;
  comprobanteUrl: string | null;
  items: { nombreSnapshot: string; colorSnapshot: string | null; tallaSnapshot: string | null; cantidad: number }[];
};

const ESTADO_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  PENDIENTE: { bg: "var(--color-warning-light)", text: "var(--color-warning)", dot: "var(--color-warning)" },
  CONFIRMADO: { bg: "#E8F0F8", text: "#3B6EA5", dot: "#3B6EA5" },
  ENVIADO: { bg: "var(--color-accent-light)", text: "var(--color-accent)", dot: "var(--color-accent)" },
  ENTREGADO: { bg: "var(--color-ink)", text: "#ffffff", dot: "#ffffff" },
  CANCELADO: { bg: "var(--color-danger-light)", text: "var(--color-danger)", dot: "var(--color-danger)" },
};

const SIGUIENTE_ESTADO: Record<string, { label: string; valor: string; icon: any }[]> = {
  PENDIENTE: [
    { label: "Confirmar", valor: "CONFIRMADO", icon: Check },
    { label: "Cancelar", valor: "CANCELADO", icon: X },
  ],
  CONFIRMADO: [
    { label: "Marcar enviado", valor: "ENVIADO", icon: Truck },
    { label: "Cancelar", valor: "CANCELADO", icon: X },
  ],
  ENVIADO: [{ label: "Marcar entregado", valor: "ENTREGADO", icon: PackageCheck }],
  ENTREGADO: [],
  CANCELADO: [],
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLE[estado] ?? { bg: "#eee", text: "#666", dot: "#999" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {estado}
    </span>
  );
}

export default function PedidosPage() {
  const { data: session } = useSession();
  const rol = (session?.user as any)?.role;
  const puedeCrear = tienePermiso(rol, "/admin/pedidos/nuevo");

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState("");

  function cargar() {
    fetch("/api/pedidos").then((r) => r.json()).then(setPedidos);
  }
  useEffect(cargar, []);

  async function cambiarEstado(id: number, nuevoEstado: string) {
    setError("");
    const res = await fetch(`/api/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoEstado }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    cargar();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-medium">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">{pedidos.length} en total</p>
        </div>
        {puedeCrear && (
          <Link href="/admin/pedidos/nuevo" className="flex items-center gap-1.5 text-sm bg-[var(--color-ink)] text-white rounded-md px-4 py-2.5 hover:bg-[var(--color-ink-light)] transition-colors">
            <Plus size={16} /> Nuevo pedido
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md mb-4">{error}</p>}

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
        {pedidos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Todavía no hay pedidos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-[var(--color-bg)] border-b border-[var(--color-line)] text-xs text-gray-600 uppercase tracking-wide">
                <th className="p-4 font-semibold">Referencia</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Ítems</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p, i) => (
                <tr key={p.id} className={`border-b border-[var(--color-line)] last:border-0 align-top ${i % 2 === 1 ? "bg-[var(--color-bg)]/50" : ""}`}>
                  <td className="p-4">
                    <span className="inline-block font-mono-data font-bold text-sm px-2.5 py-1 rounded-md bg-[var(--color-ink)] text-white">
                      {p.referencia}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-base">{p.nombreInvitado ?? "—"}</td>
                  <td className="p-4 text-gray-600">
                    {p.items.map((it, idx) => (
                      <div key={idx}>{it.nombreSnapshot} {it.colorSnapshot} {it.tallaSnapshot} ×{it.cantidad}</div>
                    ))}
                  </td>
                  <td className="p-4 font-mono-data font-bold text-lg text-[var(--color-ink)]">Bs {p.total}</td>
                  <td className="p-4">
                    <EstadoBadge estado={p.estado} />
                    {p.comprobanteUrl && (
                      <a
                        href={p.comprobanteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
                      >
                        <Receipt size={12} /> Ver comprobante
                      </a>
                    )}
                    {p.metodoPago === "qr" && !p.comprobanteUrl && (
                      <p className="mt-2 text-xs text-[var(--color-warning)]">Sin comprobante adjunto</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-end">
                      {SIGUIENTE_ESTADO[p.estado]?.map((opcion) => {
                        const s = ESTADO_STYLE[opcion.valor];
                        const Icon = opcion.icon;
                        const esCancelar = opcion.valor === "CANCELADO";
                        return (
                          <button
                            key={opcion.valor}
                            onClick={() => cambiarEstado(p.id, opcion.valor)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-transform hover:scale-105 whitespace-nowrap"
                            style={
                              esCancelar
                                ? { color: "var(--color-danger)", background: "var(--color-danger-light)" }
                                : { color: s?.text ?? "#333", background: s?.bg ?? "#eee" }
                            }
                          >
                            <Icon size={13} /> {opcion.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}