"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Ruler } from "lucide-react";

type Talla = { id: number; sigla: string; descripcion: string | null; orden: number };

export default function TallasPage() {
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [sigla, setSigla] = useState("");
  const [orden, setOrden] = useState(0);
  const [error, setError] = useState("");

  function cargar() {
    fetch("/api/tallas").then((r) => r.json()).then(setTallas);
  }
  useEffect(cargar, []);

  async function crear() {
    setError("");
    const res = await fetch("/api/tallas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sigla, orden }),
    });
    if (!res.ok) return setError((await res.json()).error);
    setSigla("");
    cargar();
  }

  async function borrar(id: number) {
    if (!confirm("¿Borrar esta talla?")) return;
    const res = await fetch(`/api/tallas/${id}`, { method: "DELETE" });
    if (!res.ok) return alert((await res.json()).error);
    cargar();
  }

  async function actualizar(id: number, campo: string, valor: string | number) {
    await fetch(`/api/tallas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
  }

  return (
    <div className="p-8 max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium flex items-center gap-2"><Ruler size={26} className="text-[var(--color-accent)]" /> Tallas</h1>
        <p className="text-sm text-gray-500 mt-1">{tallas.length} en catálogo</p>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5 flex gap-2">
        <input className="border border-[var(--color-line)] rounded-md px-3 py-2.5 flex-1 text-sm font-mono-data bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]" placeholder="Sigla (ej. M)" value={sigla} onChange={(e) => setSigla(e.target.value)} />
        <input className="border border-[var(--color-line)] rounded-md px-3 py-2.5 w-24 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]" type="number" placeholder="Orden" value={orden} onChange={(e) => setOrden(Number(e.target.value))} />
        <button onClick={crear} className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors whitespace-nowrap">
          <Plus size={16} /> Agregar
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm divide-y divide-[var(--color-line)]">
        {tallas.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-4">
            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center font-mono-data font-semibold text-sm shrink-0">
              {t.sigla}
            </span>
            <input className="border border-transparent rounded-md px-2 py-1.5 flex-1 text-sm font-mono-data hover:border-[var(--color-line)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" defaultValue={t.sigla} onBlur={(e) => actualizar(t.id, "sigla", e.target.value)} />
            <input className="border border-transparent rounded-md px-2 py-1.5 w-20 text-sm hover:border-[var(--color-line)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" type="number" defaultValue={t.orden} onBlur={(e) => actualizar(t.id, "orden", Number(e.target.value))} />
            <button onClick={() => borrar(t.id)} className="text-gray-400 hover:text-[var(--color-danger)] transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}