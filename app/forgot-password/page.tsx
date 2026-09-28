"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const [email, setEmail] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEnviado(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-8">
      <div className="w-full max-w-sm">
        {enviado ? (
          <p className="text-center text-gray-600">Si el correo existe, te llegó un link para cambiar tu contraseña.</p>
        ) : (
          <form onSubmit={enviar} className="space-y-3">
            <h1 className="font-display text-3xl font-medium mb-4 text-center">Recuperar contraseña</h1>
            <input type="email" placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="border border-[var(--color-line)] rounded-md px-3 py-3 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]" />
            <button className="w-full bg-[var(--color-ink)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
              Enviar link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}