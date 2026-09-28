"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { User, Mail, Lock } from "lucide-react";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setCargando(false);
      return;
    }
    await signIn("credentials", { email, password, redirectTo: "/" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200')" }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-ink)]/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/80 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-gold)]" />

        <div className="relative">
          <span className="font-display italic text-4xl tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Jacquard Tex
          </span>
          <div className="w-14 h-[3px] bg-[var(--color-gold)] mt-2 rounded-full" />
        </div>

        <div className="relative">
          <p className="font-display text-3xl font-medium leading-snug max-w-sm text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Únete y sé parte de nuestra próxima colección.
          </p>
          <p className="text-sm text-white/80 mt-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            Crea tu cuenta en menos de un minuto
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-[var(--color-bg)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />

        <div className="w-full max-w-sm relative">
          <span className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest">Únete</span>
          <h1 className="font-display text-4xl font-medium mt-2 mb-2 leading-tight">
            Crea tu <span className="italic text-[var(--color-accent)]">cuenta</span>
          </h1>
          <p className="text-sm text-gray-500 mb-8">Guarda tus pedidos y compra más rápido la próxima vez</p>

          {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md mb-4">{error}</p>}

          <form onSubmit={registrar} className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="border border-[var(--color-line)] rounded-lg pl-9 pr-3 py-3 w-full text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" className="border border-[var(--color-line)] rounded-lg pl-9 pr-3 py-3 w-full text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="border border-[var(--color-line)] rounded-lg pl-9 pr-3 py-3 w-full text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" placeholder="Contraseña (mínimo 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button disabled={cargando}
              className="w-full bg-[var(--color-gold)] text-[var(--color-ink)] py-3.5 rounded-lg text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            ¿Ya tienes cuenta? <a href="/login" className="text-[var(--color-accent)] font-medium hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}