"use client";
import { useEffect, useState } from "react";
import { Plus, Mail, Send, Users as UsersIcon } from "lucide-react";

type Usuario = { id: number; nombre: string; email: string; rol: string; activo: boolean };

const ROLES = ["ADMIN_PRINCIPAL", "ADMIN_INVENTARIO", "VENDEDOR_PREVENTA", "VENDEDOR_DESPACHO"];

const ROL_STYLE: Record<string, { bg: string; text: string }> = {
  ADMIN_PRINCIPAL: { bg: "var(--color-ink)", text: "#ffffff" },
  ADMIN_SECUNDARIO: { bg: "#E8F0F8", text: "#3B6EA5" },
  VENDEDOR: { bg: "var(--color-accent-light)", text: "var(--color-accent)" },
  DISTRIBUIDOR: { bg: "var(--color-warning-light)", text: "var(--color-warning)" },
};

const inputClass =
  "border border-[var(--color-line)] rounded-md px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

function Avatar({ nombre }: { nombre: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("VENDEDOR");
  const [error, setError] = useState("");

  function cargar() {
    fetch("/api/usuarios").then((r) => r.json()).then(setUsuarios);
  }
  useEffect(cargar, []);

  async function crear() {
    setError("");
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, rol }),
    });
    if (!res.ok) return setError((await res.json()).error);
    setNombre(""); setEmail(""); setPassword("");
    cargar();
  }

  async function actualizar(id: number, campo: string, valor: string | boolean) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
    cargar();
  }

  async function enviarRecuperacion(email: string) {
    await fetch("/api/auth-admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    alert("Link de recuperación enviado a " + email);
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium flex items-center gap-2">
          <UsersIcon size={26} className="text-[var(--color-accent)]" /> Usuarios y roles
        </h1>
        <p className="text-sm text-gray-500 mt-1">{usuarios.length} personas con acceso al panel</p>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Nuevo usuario</h2>
        {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input className={inputClass} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className={inputClass} placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputClass} placeholder="Contraseña temporal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className={inputClass} value={rol} onChange={(e) => setRol(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
        </div>
        <button onClick={crear} className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
          <Plus size={16} /> Crear usuario
        </button>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-[var(--color-bg)] border-b border-[var(--color-line)] text-xs text-gray-600 uppercase tracking-wide">
              <th className="p-4 font-semibold">Usuario</th>
              <th className="p-4 font-semibold">Rol</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id} className={`border-b border-[var(--color-line)] last:border-0 ${i % 2 === 1 ? "bg-[var(--color-bg)]/50" : ""}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar nombre={u.nombre} />
                    <div>
                      <input
                        className="font-medium text-sm border-b border-transparent hover:border-[var(--color-line)] focus:outline-none focus:border-[var(--color-accent)] transition-colors bg-transparent"
                        defaultValue={u.nombre}
                        onBlur={(e) => actualizar(u.id, "nombre", e.target.value)}
                      />
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={11} /> {u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <select
                    defaultValue={u.rol}
                    onChange={(e) => actualizar(u.id, "rol", e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 uppercase tracking-wide cursor-pointer"
                    style={{ background: ROL_STYLE[u.rol]?.bg, color: ROL_STYLE[u.rol]?.text }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => actualizar(u.id, "activo", !u.activo)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${u.activo ? "bg-[var(--color-accent)]" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${u.activo ? "translate-x-5" : ""}`} />
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => enviarRecuperacion(u.email)}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] font-medium hover:underline ml-auto"
                  >
                    <Send size={12} /> Recuperación
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}