import { prisma } from "@/lib/prisma";

export default async function NosotrosPage() {
  const empresa = await prisma.empresa.findFirst({
    include: { media: { orderBy: { orden: "asc" } } },
  });

  const carrusel = empresa?.media.filter((m) => m.tipo === "CARRUSEL") ?? [];

  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center bg-[var(--color-ink)] text-white text-center">
        <div className="max-w-2xl px-6">
          <h1 className="font-display italic text-5xl font-medium">
            {empresa?.tituloHistoria ?? "Nuestra historia"}
          </h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
          {empresa?.descripcionHistoria ??
            "Jacquard Tex nació de la pasión por crear prendas que combinan calidad, diseño y personalidad. Cada pieza está pensada para acompañar el estilo de vida de quien la usa, con materiales cuidadosamente seleccionados y atención al detalle en cada proceso."}
        </p>

        {empresa?.filosofia && (
          <div className="mt-12 bg-[var(--color-bg)] rounded-xl p-8 border-l-4 border-[var(--color-gold)]">
            <p className="font-display italic text-2xl leading-snug">{empresa.filosofia}</p>
          </div>
        )}
      </section>

      {carrusel.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-5">
            {carrusel.map((item) => (
              <div key={item.id} className="aspect-[4/5] rounded-xl overflow-hidden bg-[var(--color-bg)]">
                {item.enlace && <img src={item.enlace} className="w-full h-full object-cover" />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}