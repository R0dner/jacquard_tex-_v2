"use client";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { QuickViewModal } from "./quick-view-modal";

type Producto = {
  id: number; slug: string; nombre: string;
  imagenes: { url: string; principal: boolean }[];
  variantes: { precioVenta: string; stockActual: number; enOferta: boolean; precioOferta: string | null }[];
};

export function ProductGridHome({ productos }: { productos: Producto[] }) {
  const [slugAbierto, setSlugAbierto] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {productos.map((p) => {
          const portada = p.imagenes.find((i) => i.principal) ?? p.imagenes[0];
          const enOferta = p.variantes.some((v) => v.enOferta && v.precioOferta);
          const precios = p.variantes
            .map((v) => Number(v.enOferta && v.precioOferta ? v.precioOferta : v.precioVenta))
            .filter(Boolean);
          const precioDesde = precios.length ? Math.min(...precios) : null;
          return (
            <button key={p.id} onClick={() => setSlugAbierto(p.slug)} className="group text-left block">
              <div className="aspect-[3/4] bg-[var(--color-bg)] rounded-lg overflow-hidden mb-3 relative">
                {portada ? (
                  <img src={portada.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
                )}
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  enOferta ? "bg-[var(--color-danger)] text-white" : "bg-[var(--color-gold)] text-[var(--color-ink)]"
                }`}>
                  {enOferta ? "Oferta" : "Nuevo"}
                </span>
                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="flex items-center justify-center gap-1.5 bg-[var(--color-ink)] text-white text-xs font-semibold py-2.5 rounded-full shadow-lg">
                    <ShoppingBag size={13} /> Vista rápida
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">{p.nombre}</h3>
              {precioDesde && (
                <p className="text-sm font-bold text-[var(--color-ink)] mt-1">
                  Desde <span className="text-[var(--color-gold)] bg-[var(--color-ink)] px-1.5 py-0.5 rounded ml-0.5">Bs {precioDesde.toFixed(2)}</span>
                </p>
              )}
            </button>
          );
        })}
      </div>

      {slugAbierto && <QuickViewModal slug={slugAbierto} onClose={() => setSlugAbierto(null)} />}
    </>
  );
}