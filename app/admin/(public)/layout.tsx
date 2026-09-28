const IMG_LOGIN = "https://aonair0wygsjjjrn.public.blob.vercel-storage.com/login%20back.jpg";

export default function PublicAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-[var(--color-ink)] text-white p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${IMG_LOGIN}')` }}
        />

        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-ink)]/90 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/80 to-transparent" />

        <div className="absolute inset-0 shadow-[inset_0_0_100px_30px_rgba(28,35,51,0.4)]" />
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-gold)]" />

        <div className="relative">
          <span className="font-display italic text-4xl tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Jacquard Tex
          </span>
          <div className="w-14 h-[3px] bg-[var(--color-gold)] mt-2 rounded-full" />
        </div>

        <div className="relative">
          <p className="font-display text-3xl font-medium leading-snug max-w-sm text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            El taller donde cada prenda empieza con un hilo, y cada venta con un buen registro.
          </p>
          <p className="text-sm text-white/80 mt-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            Panel interno — uso exclusivo del equipo
          </p>
        </div>
      </div>
        <div className="flex items-center justify-center p-8 bg-[var(--color-bg)] relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
          <div className="relative">{children}</div>
        </div>
    </div>
  );
}