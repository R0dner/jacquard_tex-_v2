"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function CarritoPage() {
  const { items, actualizarCantidad, quitar, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg)] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h1 className="font-display text-3xl font-medium mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Explora la colección y encuentra algo que te encante.</p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-[var(--color-ink)] text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors"
        >
          Ir a la tienda <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="font-display text-4xl font-medium mb-10">Tu carrito</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 divide-y divide-[var(--color-line)]">
          {items.map((item) => (
            <div key={item.sku} className="flex gap-5 py-6">
              <div className="w-28 h-28 bg-[var(--color-bg)] rounded-xl overflow-hidden shrink-0">
                {item.imagen && <img src={item.imagen} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.nombre}</h3>
                    <button onClick={() => quitar(item.sku)} className="text-gray-300 hover:text-[var(--color-danger)] transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.color} {item.talla && `· Talla ${item.talla}`}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-[var(--color-line)] rounded-full">
                    <button onClick={() => actualizarCantidad(item.sku, Math.max(1, item.cantidad - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500">
                      <Minus size={13} />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.sku, Math.min(item.stockDisponible, item.cantidad + 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-mono-data font-semibold text-lg">Bs {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-[var(--color-bg)] rounded-xl p-6 sticky top-24">
            <h2 className="font-medium mb-4">Resumen</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal</span>
              <span className="font-mono-data">Bs {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-4">
              <span>Envío</span>
              <span>Se calcula al confirmar</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-[var(--color-line)] mb-6">
              <span>Total</span>
              <span className="font-mono-data">Bs {total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] py-3.5 rounded-full text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Continuar al pago <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 space-y-3 text-xs text-gray-500">
            <div className="flex items-center gap-2"><Truck size={15} className="text-[var(--color-accent)]" /> Envío a todo el país</div>
            <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[var(--color-accent)]" /> Pago seguro</div>
            <div className="flex items-center gap-2"><RotateCcw size={15} className="text-[var(--color-accent)]" /> Cambios dentro de 15 días</div>
          </div>
        </div>
      </div>
    </div>
  );
}