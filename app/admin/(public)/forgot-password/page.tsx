"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const [email, setEmail] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth-admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEnviado(true);
  }

  if (enviado) return <p className="max-w-sm mx-auto mt-20">Si el correo existe, te llegó un link para cambiar tu contraseña.</p>;

  return (
    <form onSubmit={enviar} className="max-w-sm mx-auto mt-20 p-8 border rounded space-y-4">
      <h1 className="text-xl font-bold">Recuperar contraseña</h1>
      <input type="email" placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" required />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">Enviar link</button>
    </form>
  );
}