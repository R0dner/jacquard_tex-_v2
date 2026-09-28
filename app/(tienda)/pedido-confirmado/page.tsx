"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";

export default function PedidoConfirmadoPage() {
  const params = useSearchParams();
  const ref = params.get("ref");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-[var(--color-accent)]" />
        </div>
        <h1 className="font-display text-4xl font-medium mb-3">¡Pedido recibido!</h1>
        <p className="text-gray-500 mb-6">
          Gracias por tu compra. Te contactaremos pronto para confirmar los detalles de entrega.
        </p>

        <div className="bg-[var(--color-bg)] rounded-xl p-5 mb-8 flex items-center justify-center gap-3">
          <Package size={20} className="text-[var(--color-accent)]" />
          <div className="text-left">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Número de referencia</p>
            <p className="font-mono-data font-bold text-lg">{ref}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/mis-pedidos"
            className="flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors"
          >
            Ver mis pedidos <ArrowRight size={15} />
          </Link>
          <Link href="/productos" className="text-[var(--color-accent)] font-medium text-sm hover:underline">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}