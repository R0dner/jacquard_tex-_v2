"use client";
import { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Variante = {
  id: number; sku: string; precioVenta: string; stockActual: number;
  enOferta: boolean; precioOferta: string | null;
  color: { id: number; nombre: string; hex: string | null } | null;
  talla: { id: number; sigla: string } | null;
};
type ImagenProducto = { url: string; colorId: number | null };
type ProductoDetalle = {
  id: number; nombre: string; slug: string; descripcion: string | null;
  imagenes: ImagenProducto[];
  variantes: Variante[];
};

export function QuickViewModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { agregar } = useCart();
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [colorId, setColorId] = useState<number | null>(null);
  const [tallaId, setTallaId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    fetch(`/api/tienda/productos/${slug}`).then((r) => r.json()).then(setProducto);
  }, [slug]);

  useEffect(() => {
    setImagenActiva(0); // al cambiar de color, vuelve a mostrar la primera foto de ese color
  }, [colorId]);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  if (!producto) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-16 text-gray-400">Cargando...</div>
      </div>
    );
  }

  const coloresDisponibles = Array.from(
    new Map(producto.variantes.filter((v) => v.color).map((v) => [v.color!.id, v.color!])).values()
  );
  const variantesDelColor = colorId ? producto.variantes.filter((v) => v.color?.id === colorId) : producto.variantes;
  const tallasDisponibles = Array.from(
    new Map(variantesDelColor.filter((v) => v.talla).map((v) => [v.talla!.id, v.talla!])).values()
  );
  const varianteSel = producto.variantes.find((v) => v.color?.id === colorId && v.talla?.id === tallaId);
  const vRef = varianteSel ?? producto.variantes[0];
  const enOferta = !!(vRef?.enOferta && vRef?.precioOferta);

  // Imágenes: primero las del color elegido; si no hay, las generales; si tampoco, todas.
  const imagenesDelColor = colorId ? producto.imagenes.filter((i) => i.colorId === colorId) : [];
  const imagenesGenerales = producto.imagenes.filter((i) => !i.colorId);
  const imagenesAMostrar = imagenesDelColor.length > 0 ? imagenesDelColor : imagenesGenerales.length > 0 ? imagenesGenerales : producto.imagenes;

  function stockPara(cId: number | null, tId: number | null) {
    return producto!.variantes.find((v) => v.color?.id === cId && v.talla?.id === tId)?.stockActual ?? 0;
  }

  async function agregarAlCarrito() {
    if (!varianteSel) return;
    const precioFinal = varianteSel.enOferta && varianteSel.precioOferta
      ? Number(varianteSel.precioOferta)
      : Number(varianteSel.precioVenta);
    agregar({
      sku: varianteSel.sku,
      nombre: producto!.nombre,
      color: varianteSel.color?.nombre ?? null,
      talla: varianteSel.talla?.sigla ?? null,
      precio: precioFinal,
      cantidad,
      imagen: imagenesAMostrar[0]?.url ?? null,
      stockDisponible: varianteSel.stockActual,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-auto grid md:grid-cols-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="aspect-square bg-[var(--color-bg)] rounded-xl overflow-hidden">
            {imagenesAMostrar[imagenActiva] ? (
              <img src={imagenesAMostrar[imagenActiva].url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
            )}
          </div>
          {imagenesAMostrar.length > 1 && (
            <div className="flex gap-2 mt-3">
              {imagenesAMostrar.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImagenActiva(i)}
                  className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                    imagenActiva === i ? "border-[var(--color-accent)]" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 pt-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)] transition-colors">
            <X size={18} />
          </button>

          <h2 className="font-display text-3xl font-medium pr-8 leading-tight">{producto.nombre}</h2>
          {producto.descripcion && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{producto.descripcion}</p>}

          <div className="flex items-center gap-3 mt-3">
            {enOferta ? (
              <>
                <p className="text-2xl font-bold font-mono-data text-[var(--color-danger)]">Bs {Number(vRef.precioOferta).toFixed(2)}</p>
                <p className="text-base font-mono-data text-gray-400 line-through">Bs {Number(vRef.precioVenta).toFixed(2)}</p>
              </>
            ) : (
              <p className="text-2xl font-bold font-mono-data">Bs {Number(vRef?.precioVenta ?? 0).toFixed(2)}</p>
            )}
          </div>

          <div className="mt-7 bg-[var(--color-bg)] rounded-xl p-4">
            <p className="text-sm font-medium mb-3">
              Color {colorId && <span className="text-[var(--color-accent)] font-semibold">— {coloresDisponibles.find((c) => c.id === colorId)?.nombre}</span>}
            </p>
            <div className="flex gap-3">
              {coloresDisponibles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setColorId(c.id); setTallaId(null); }}
                  className="relative w-11 h-11 rounded-full transition-transform duration-200"
                  style={{
                    background: c.hex || "#ccc",
                    boxShadow: colorId === c.id
                      ? `0 0 0 3px white, 0 0 0 5px ${c.hex || "#999"}, 0 4px 10px ${c.hex || "#999"}66`
                      : "0 0 0 2px white, 0 0 0 3px var(--color-line)",
                    transform: colorId === c.id ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {colorId === c.id && <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 bg-[var(--color-bg)] rounded-xl p-4">
            <p className="text-sm font-medium mb-3">Talla</p>
            <div className="flex flex-wrap gap-2.5">
              {tallasDisponibles.map((t) => {
                const stock = stockPara(colorId, t.id);
                const agotado = stock === 0;
                return (
                  <button
                    key={t.id}
                    disabled={agotado}
                    onClick={() => setTallaId(t.id)}
                    className={`relative w-12 h-12 rounded-full text-sm font-semibold transition-all overflow-hidden ${
                      agotado
                        ? "bg-white text-gray-300 cursor-not-allowed"
                        : tallaId === t.id
                        ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-md scale-110"
                        : "bg-white text-gray-700 hover:bg-[var(--color-gold-light)] shadow-sm"
                    }`}
                  >
                    {t.sigla}
                    {agotado && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-[150%] h-[1.5px] bg-gray-300 rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {varianteSel && (
            <p className={`text-xs mt-3 font-semibold ${varianteSel.stockActual <= 3 && varianteSel.stockActual > 0 ? "text-[var(--color-warning)]" : "text-gray-400"}`}>
              {varianteSel.stockActual > 0 ? `✓ ${varianteSel.stockActual} disponibles` : "Agotado"}
            </p>
          )}

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border-2 border-[var(--color-line)] rounded-full">
              <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[var(--color-ink)]">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold">{cantidad}</span>
              <button
                onClick={() => setCantidad((c) => Math.min(varianteSel?.stockActual ?? 1, c + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[var(--color-ink)]"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={agregarAlCarrito}
              disabled={!varianteSel || varianteSel.stockActual === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] py-3.5 rounded-full text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {agregado ? <><Check size={16} /> Agregado</> : <><ShoppingBag size={16} /> Agregar al carrito</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}