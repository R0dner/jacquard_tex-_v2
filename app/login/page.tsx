"use client";
import { useActionState } from "react";
import { loginCliente, loginGoogleCliente } from "./actions";
import { Mail, Lock } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.7 35 27 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.4 36.5 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginCliente, undefined);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200')" }}
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
            Diseños que se sienten tuyos desde el primer día.
          </p>
          <p className="text-sm text-white/80 mt-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            Guarda tus pedidos y compra más rápido cada vez
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-[var(--color-bg)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />

        <div className="w-full max-w-sm relative">
          <span className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest">Tu cuenta</span>
          <h1 className="font-display text-4xl font-medium mt-2 mb-2 leading-tight">
            Bienvenido de <span className="italic text-[var(--color-accent)]">vuelta</span>
          </h1>
          <p className="text-sm text-gray-500 mb-8">Inicia sesión para ver tus pedidos y comprar más rápido</p>

          {state?.error && (
            <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md mb-4">{state.error}</p>
          )}

          <form action={formAction} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="email" type="email" placeholder="Correo" required
                className="border border-[var(--color-line)] rounded-lg pl-9 pr-3 py-3 w-full text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="password" type="password" placeholder="Contraseña" required
                className="border border-[var(--color-line)] rounded-lg pl-9 pr-3 py-3 w-full text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
            </div>
            <button disabled={pending}
              className="w-full bg-[var(--color-gold)] text-[var(--color-ink)] py-3.5 rounded-lg text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <a href="/forgot-password" className="text-xs text-[var(--color-accent)] block text-center mt-4 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-[var(--color-line)] flex-1" />
            <span className="text-xs text-gray-400">o</span>
            <div className="h-px bg-[var(--color-line)] flex-1" />
          </div>

          <form action={loginGoogleCliente}>
            <button className="w-full flex items-center justify-center gap-2.5 border border-[var(--color-line)] rounded-lg py-3.5 text-sm font-medium bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <GoogleIcon /> Entrar con Google
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            ¿No tienes cuenta? <a href="/registro" className="text-[var(--color-accent)] font-medium hover:underline">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  );
}