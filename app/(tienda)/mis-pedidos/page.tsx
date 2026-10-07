import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PackageSearch, ArrowRight } from "lucide-react";
import Link from "next/link";

const ESTADO_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  PENDIENTE: { bg: "var(--color-warning-light)", text: "var(--color-warning)", dot: "var(--color-warning)" },
  RESERVADO: { bg: "#F3EAD6", text: "#8A6A1F", dot: "#C9A961" },
  CONFIRMADO: { bg: "#E8F0F8", text: "#3B6EA5", dot: "#3B6EA5" },
  ENVIADO: { bg: "var(--color-accent-light)", text: "var(--color-accent)", dot: "var(--color-accent)" },
  ENTREGADO: { bg: "var(--color-ink)", text: "#ffffff", dot: "#ffffff" },
  CANCELADO: { bg: "var(--color-danger-light)", text: "var(--color-danger)", dot: "var(--color-danger)" },
};

export default async function MisPedidosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: Number((session.user as any).id) },
    include: { items: true },
    orderBy: { fechaPedido: "desc" },
  });

  return (
    <div>
      <div className="bg-[var(--color-bg)] border-b border-[var(--color-line)] py-10">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-display text-4xl font-medium">Mis pedidos</h1>
          <p className="text-gray-500 mt-1">Hola {session.user.name?.split(" ")[0]}, aquí está tu historial de compras</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {pedidos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[var(--color-bg)] flex items-center justify-center mx-auto mb-5">
              <PackageSearch size={32} className="text-gray-300" />
            </div>
            <h2 className="font-display text-2xl font-medium mb-2">Todavía no has hecho ningún pedido</h2>
            <Link href="/productos" className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium hover:underline mt-2">
              Ir a la tienda <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {pedidos.map((p) => {
              const s = ESTADO_STYLE[p.estado] ?? { bg: "#eee", text: "#666", dot: "#999" };
              return (
                <div key={p.id} className="bg-white border border-[var(--color-line)] rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block font-mono-data font-bold text-sm px-2.5 py-1 rounded-md bg-[var(--color-ink)] text-white">
                        {p.referencia}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(p.fechaPedido).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                      style={{ background: s.bg, color: s.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {p.estado}
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--color-line)]">
                    {p.items.map((it, i) => (
                      <div key={i} className="flex justify-between py-2 text-sm">
                        <span className="text-gray-600">{it.nombreSnapshot} {it.colorSnapshot} {it.tallaSnapshot} × {it.cantidad}</span>
                        <span className="font-mono-data font-medium">Bs {Number(it.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {Number(p.costoEnvio) > 0 && (
                    <div className="flex justify-between py-2 text-sm text-gray-600 border-t border-[var(--color-line)]">
                      <span>Envío{p.departamentoEnvio ? ` (${p.departamentoEnvio})` : ""}</span>
                      <span className="font-mono-data font-medium">Bs {Number(p.costoEnvio).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 mt-3 border-t border-[var(--color-line)] font-bold">
                    <span>Total</span>
                    <span className="font-mono-data text-lg">Bs {Number(p.total).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}