"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) return setError((await res.json()).error);
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-8">
      <form onSubmit={guardar} className="w-full max-w-sm space-y-3">
        <h1 className="font-display text-3xl font-medium mb-4 text-center">Nueva contraseña</h1>
        {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md">{error}</p>}
        <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
          className="border border-[var(--color-line)] rounded-md px-3 py-3 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]" />
        <button className="w-full bg-[var(--color-ink)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
          Guardar
        </button>
      </form>
    </div>
  );
}