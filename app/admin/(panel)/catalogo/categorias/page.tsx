"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Layers } from "lucide-react";

type Grupo = { id: number; nombre: string; prefijoCodigo: string | null; categoriaId: number | null };
type Categoria = { id: number; nombre: string; descripcion: string | null; grupos: Grupo[] };

const inputClass =
  "border border-[var(--color-line)] rounded-md px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombreCat, setNombreCat] = useState("");
  const [errorCat, setErrorCat] = useState("");

  const [nombreGrupo, setNombreGrupo] = useState("");
  const [prefijo, setPrefijo] = useState("");
  const [categoriaIdGrupo, setCategoriaIdGrupo] = useState<number | "">("");
  const [errorGrupo, setErrorGrupo] = useState("");

  function cargar() {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }
  useEffect(cargar, []);

  async function crearCategoria() {
    setErrorCat("");
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreCat }),
    });
    if (!res.ok) return setErrorCat((await res.json()).error);
    setNombreCat("");
    cargar();
  }

  async function borrarCategoria(id: number) {
    if (!confirm("¿Borrar esta categoría?")) return;
    const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    if (!res.ok) return alert((await res.json()).error);
    cargar();
  }

  async function crearGrupo() {
    setErrorGrupo("");
    if (!categoriaIdGrupo) return setErrorGrupo("Elige una categoría");
    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreGrupo, prefijoCodigo: prefijo, categoriaId: categoriaIdGrupo }),
    });
    if (!res.ok) return setErrorGrupo((await res.json()).error);
    setNombreGrupo("");
    setPrefijo("");
    cargar();
  }

  async function borrarGrupo(id: number) {
    if (!confirm("¿Borrar este grupo?")) return;
    const res = await fetch(`/api/grupos/${id}`, { method: "DELETE" });
    if (!res.ok) return alert((await res.json()).error);
    cargar();
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium">Categorías y grupos</h1>
        <p className="text-sm text-gray-500 mt-1">Organiza tu catálogo y define prefijos de código</p>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Tag size={14} /> Nueva categoría
        </h2>
        <div className="flex gap-2">
          <input className={inputClass} placeholder="Ej. Camisas" value={nombreCat} onChange={(e) => setNombreCat(e.target.value)} />
          <button onClick={crearCategoria} className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors whitespace-nowrap">
            <Plus size={16} /> Agregar
          </button>
        </div>
        {errorCat && <p className="text-sm text-[var(--color-danger)] mt-2">{errorCat}</p>}
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6 space-y-3">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Layers size={14} /> Nuevo grupo
        </h2>
        <select className={inputClass} value={categoriaIdGrupo} onChange={(e) => setCategoriaIdGrupo(Number(e.target.value))}>
          <option value="">Elige la categoría...</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input className={inputClass} placeholder="Nombre del grupo (ej. Manga Larga)" value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)} />
        <input className={`${inputClass} font-mono-data`} placeholder="Prefijo de código (ej. CML)" value={prefijo} onChange={(e) => setPrefijo(e.target.value.toUpperCase())} />
        <button onClick={crearGrupo} className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
          <Plus size={16} /> Agregar grupo
        </button>
        {errorGrupo && <p className="text-sm text-[var(--color-danger)]">{errorGrupo}</p>}
      </div>

      <div className="space-y-4">
        {categorias.map((cat) => (
          <div key={cat.id} className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--color-line)]">
              <h3 className="font-semibold text-base">{cat.nombre}</h3>
              <button onClick={() => borrarCategoria(cat.id)} className="text-gray-400 hover:text-[var(--color-danger)] transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            {cat.grupos.length === 0 ? (
              <p className="text-sm text-gray-400">Sin grupos todavía</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cat.grupos.map((g) => (
                  <span key={g.id} className="inline-flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-full pl-3 pr-1.5 py-1 text-sm">
                    {g.nombre}
                    {g.prefijoCodigo && <span className="font-mono-data text-xs text-[var(--color-accent)] bg-[var(--color-accent-light)] px-1.5 py-0.5 rounded-full">{g.prefijoCodigo}</span>}
                    <button onClick={() => borrarGrupo(g.id)} className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}