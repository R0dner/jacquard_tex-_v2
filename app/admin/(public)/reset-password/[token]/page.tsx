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
    const res = await fetch("/api/auth-admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) return setError((await res.json()).error);
    router.push("/admin/login");
  }

  return (
    <form onSubmit={guardar} className="max-w-sm mx-auto mt-20 p-8 border rounded space-y-4">
      <h1 className="text-xl font-bold">Nueva contraseña</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" required minLength={8} />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">Guardar</button>
    </form>
  );
}