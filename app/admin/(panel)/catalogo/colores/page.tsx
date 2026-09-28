"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Palette } from "lucide-react";

type Color = { id: number; nombre: string; hex: string | null };

export default function ColoresPage() {
  const [colores, setColores] = useState<Color[]>([]);
  const [nombre, setNombre] = useState("");
  const [hex, setHex] = useState("#2F6E5B");
  const [error, setError] = useState("");

  function cargar() {
    fetch("/api/colores").then((r) => r.json()).then(setColores);
  }
  useEffect(cargar, []);

  async function crear() {
    setError("");
    const res = await fetch("/api/colores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, hex }),
    });
    if (!res.ok) return setError((await res.json()).error);
    setNombre("");
    cargar();
  }

  async function borrar(id: number) {
    if (!confirm("¿Borrar este color?")) return;
    const res = await fetch(`/api/colores/${id}`, { method: "DELETE" });
    if (!res.ok) return alert((await res.json()).error);
    cargar();
  }

  async function actualizar(id: number, campo: string, valor: string) {
    await fetch(`/api/colores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
  }

  return (
    <div className="p-8 max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium flex items-center gap-2"><Palette size={26} className="text-[var(--color-accent)]" /> Colores</h1>
        <p className="text-sm text-gray-500 mt-1">{colores.length} en catálogo</p>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5 flex gap-2 items-center">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="color-swatch w-11 h-11 shrink-0"
        />
        <input
          className="border border-[var(--color-line)] rounded-md px-3 py-2.5 flex-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
          placeholder="Nombre del color"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button onClick={crear} className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors whitespace-nowrap">
          <Plus size={16} /> Agregar
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm divide-y divide-[var(--color-line)]">
        {colores.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-4">
            <input type="color" defaultValue={c.hex ?? "#000000"} onBlur={(e) => actualizar(c.id, "hex", e.target.value)} className="color-swatch w-9 h-9" />
            <input
              className="border border-transparent rounded-md px-2 py-1.5 flex-1 text-sm font-medium hover:border-[var(--color-line)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              defaultValue={c.nombre}
              onBlur={(e) => actualizar(c.id, "nombre", e.target.value)}
            />
            <button onClick={() => borrar(c.id)} className="text-gray-400 hover:text-[var(--color-danger)] transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}