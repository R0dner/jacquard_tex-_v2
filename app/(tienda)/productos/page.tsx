"use client";
import { useEffect, useState } from "react";
import { SlidersHorizontal, ShoppingBag, X } from "lucide-react";
import { QuickViewModal } from "../quick-view-modal";

type Producto = {
  id: number; slug: string; nombre: string;
  imagenes: { url: string; principal: boolean }[];
  variantes: { precioVenta: string; stockActual: number; colorId: number | null; tallaId: number | null; enOferta: boolean; precioOferta: string | null }[];
};
type Color = { id: number; nombre: string; hex: string | null };
type Talla = { id: number; sigla: string };

export default function GaleriaProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [colorSel, setColorSel] = useState<number | null>(null);
  const [tallaSel, setTallaSel] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [slugAbierto, setSlugAbierto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/colores").then((r) => r.json()).then(setColores);
    fetch("/api/tallas").then((r) => r.json()).then(setTallas);
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (colorSel) params.set("color", String(colorSel));
    if (tallaSel) params.set("talla", String(tallaSel));
    fetch(`/api/tienda/productos?${params}`).then((r) => r.json()).then((data) => {
      setProductos(data);
      setCargando(false);
    });
  }, [colorSel, tallaSel]);

  const hayFiltros = colorSel !== null || tallaSel !== null;

  return (
    <div>
      <div className="bg-[var(--color-bg)] border-b border-[var(--color-line)] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Inicio / Tienda</p>
          <h1 className="font-display text-5xl font-medium">Toda la colección</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          <aside className="w-52 shrink-0 hidden md:block sticky top-24 self-start">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <SlidersHorizontal size={13} /> Filtrar
            </p>

            <div className="mb-7">
              <p className="text-sm font-medium mb-3">Color</p>
              <div className="flex flex-wrap gap-2.5">
                {colores.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorSel(colorSel === c.id ? null : c.id)}
                    title={c.nombre}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${colorSel === c.id ? "border-[var(--color-accent)] scale-110 shadow-md" : "border-white shadow"}`}
                    style={{ background: c.hex || "#ccc" }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-7">
              <p className="text-sm font-medium mb-3">Talla</p>
              <div className="flex flex-wrap gap-2">
                {tallas.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTallaSel(tallaSel === t.id ? null : t.id)}
                    className={`w-10 h-10 rounded-full text-xs font-medium border transition-colors ${
                      tallaSel === t.id ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-white" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                    }`}
                  >
                    {t.sigla}
                  </button>
                ))}
              </div>
            </div>

            {hayFiltros && (
              <button
                onClick={() => { setColorSel(null); setTallaSel(null); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[var(--color-danger)] transition-colors"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </aside>

          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-6">{cargando ? "Cargando..." : `${productos.length} productos`}</p>

            {cargando ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[var(--color-bg)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : productos.length === 0 ? (
              <p className="text-gray-400 text-sm py-12 text-center">No hay productos con esos filtros.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productos.map((p) => {
                  const portada = p.imagenes.find((i) => i.principal) ?? p.imagenes[0];
                  const enOferta = p.variantes.some((v) => v.enOferta && v.precioOferta);
                  const precios = p.variantes
                    .map((v) => Number(v.enOferta && v.precioOferta ? v.precioOferta : v.precioVenta))
                    .filter(Boolean);
                  const precioDesde = precios.length ? Math.min(...precios) : null;
                  const stockTotal = p.variantes.reduce((s, v) => s + v.stockActual, 0);
                  return (
                    <button key={p.id} onClick={() => setSlugAbierto(p.slug)} className="group text-left">
                      <div className="aspect-[3/4] bg-[var(--color-bg)] rounded-lg overflow-hidden mb-3 relative">
                        {portada ? (
                          <img src={portada.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
                        )}
                        {stockTotal === 0 ? (
                          <span className="absolute top-3 left-3 bg-[var(--color-ink)] text-white text-xs px-2.5 py-1 rounded-full">Agotado</span>
                        ) : (
                          <>
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
                          </>
                        )}
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
            )}
          </div>
        </div>
      </div>

      {slugAbierto && <QuickViewModal slug={slugAbierto} onClose={() => setSlugAbierto(null)} />}
    </div>
  );
}