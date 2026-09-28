import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import { ProductGridHome } from "./product-grid-home";

const IMG_HERO = "https://aonair0wygsjjjrn.public.blob.vercel-storage.com/ropa%20mujeres.jpg";
const IMAGENES_CATEGORIAS = [
  "https://aonair0wygsjjjrn.public.blob.vercel-storage.com/ropa%20hombres.jpg",
  "https://aonair0wygsjjjrn.public.blob.vercel-storage.com/ropa%20mujeres.jpg",
  "https://aonair0wygsjjjrn.public.blob.vercel-storage.com/ropa%20ni%C3%B1os.jpg",
];

export default async function HomePage() {
  const [productos, categorias] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true },
      include: { imagenes: true, variantes: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.categoria.findMany({ take: 3 }),
  ]);

  const productosParaGrid = productos.map((p) => ({
    ...p,
    variantes: p.variantes.map((v) => ({
      ...v,
      precioCosto: v.precioCosto.toString(),
      precioVenta: v.precioVenta.toString(),
      precioOferta: v.precioOferta ? v.precioOferta.toString() : null,
    })),
  }));

  return (
    <div>
      <section className="relative h-[88vh] flex items-center overflow-hidden bg-[var(--color-ink)] texture-noise">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url('${IMG_HERO}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-ink)]/50 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <span className="inline-block bg-[var(--color-gold)] text-[var(--color-ink)] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Nueva colección
          </span>
          <h1 className="font-display text-6xl md:text-8xl text-white font-medium leading-[0.95] max-w-3xl">
            Estilo que <span className="italic">define</span> quién eres
          </h1>
          <p className="text-white/70 text-lg mt-6 max-w-md">
            Descubre las últimas tendencias para todos los estilos y personalidades.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-white text-[var(--color-ink)] px-7 py-3.5 rounded-full text-sm font-semibold mt-8 hover:bg-[var(--color-gold)] transition-colors"
          >
            Ver colección <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {categorias.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-3xl font-medium mb-10">Compra por categoría</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {categorias.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.id}`}
                className="relative aspect-[4/5] rounded-xl overflow-hidden group bg-[var(--color-ink)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  style={{ backgroundImage: `url('${IMAGENES_CATEGORIAS[i % IMAGENES_CATEGORIAS.length]}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-5 left-5 font-display italic text-2xl text-white">{cat.nombre}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="font-display text-3xl font-medium">Recién llegados</h2>
          <Link href="/productos" className="text-sm text-[var(--color-accent)] font-medium hover:underline">
            Ver todo →
          </Link>
        </div>
        <ProductGridHome productos={productosParaGrid} />
      </section>

      <section className="bg-[var(--color-ink)] text-white py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-display italic text-xl mb-1">Envío a todo el país</p>
            <p className="text-white/50 text-sm">Gratis en compras mayores a Bs 300</p>
          </div>
          <div>
            <p className="font-display italic text-xl mb-1">Cambios sin complicaciones</p>
            <p className="text-white/50 text-sm">15 días para cambiar de talla o color</p>
          </div>
          <div>
            <p className="font-display italic text-xl mb-1">Pago seguro</p>
            <p className="text-white/50 text-sm">Contra entrega, transferencia o tarjeta</p>
          </div>
        </div>
      </section>
    </div>
  );
}