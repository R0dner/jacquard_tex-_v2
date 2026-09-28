"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Palette, FileText, ArrowLeft, X, ArrowRight } from "lucide-react";

type Color = { id: number; nombre: string; hex: string | null };
type Talla = { id: number; sigla: string };
type Grupo = { id: number; nombre: string };
type Variante = { id: number; sku: string };
type Imagen = { id: number; url: string; colorId: number | null };

const PASOS = [
  { n: 1, label: "Datos", icon: FileText },
  { n: 2, label: "Variantes", icon: Palette },
  { n: 3, label: "Fotos", icon: ImagePlus },
];

const inputClass =
  "border border-[var(--color-line)] rounded-md px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [productoId, setProductoId] = useState<number | null>(null);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState<number | null>(null);

  const [colores, setColores] = useState<Color[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [coloresSel, setColoresSel] = useState<number[]>([]);
  const [tallasPorColor, setTallasPorColor] = useState<Record<number, number[]>>({});
  const [variantesCreadas, setVariantesCreadas] = useState<Variante[]>([]);

  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [colorFotoActual, setColorFotoActual] = useState<number | "">("");
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    fetch("/api/colores").then((r) => r.json()).then(setColores);
    fetch("/api/tallas").then((r) => r.json()).then(setTallas);
    fetch("/api/grupos").then((r) => r.json()).then(setGrupos);
  }, []);

  async function elegirGrupo(id: number) {
    setGrupoId(id);
    const res = await fetch(`/api/grupos/${id}/siguiente-codigo`);
    const data = await res.json();
    if (data.codigo) setCodigo(data.codigo);
  }

  async function crearProducto() {
    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, nombre, descripcion, grupoId }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setProductoId(data.id);
    setPaso(2);
  }

  function toggleColor(colorId: number) {
    setColoresSel((prev) => {
      if (prev.includes(colorId)) {
        setTallasPorColor((t) => {
          const copia = { ...t };
          delete copia[colorId];
          return copia;
        });
        return prev.filter((id) => id !== colorId);
      }
      return [...prev, colorId];
    });
  }

  function toggleTallaDeColor(colorId: number, tallaId: number) {
    setTallasPorColor((prev) => {
      const actuales = prev[colorId] ?? [];
      const nuevas = actuales.includes(tallaId) ? actuales.filter((id) => id !== tallaId) : [...actuales, tallaId];
      return { ...prev, [colorId]: nuevas };
    });
  }

  async function generarVariantes() {
    const combinaciones = coloresSel
      .map((colorId) => ({ colorId, tallaIds: tallasPorColor[colorId] ?? [] }))
      .filter((c) => c.tallaIds.length > 0);

    if (combinaciones.length === 0) {
      alert("Elige al menos una talla para algún color.");
      return;
    }

    const res = await fetch(`/api/productos/${productoId}/variantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ combinaciones }),
    });
    const data = await res.json();
    setVariantesCreadas(data);
    setPaso(3);
  }

  async function subirImagen(file: File) {
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productoId", String(productoId));
      formData.append("principal", String(imagenes.length === 0));
      if (colorFotoActual) formData.append("colorId", String(colorFotoActual));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        alert("No se pudo subir la foto, intenta de nuevo.");
        return;
      }
      const data = await res.json();
      setImagenes((prev) => [...prev, data]);
    } finally {
      setSubiendo(false);
    }
  }

  async function cancelar() {
    if (productoId && !confirm("¿Seguro? Se borrará el producto que llevas creado hasta ahora.")) return;
    if (productoId) await fetch(`/api/productos/${productoId}`, { method: "DELETE" });
    router.push("/admin/productos");
  }

  function terminarYAgregarStock() {
    router.push("/admin/inventario/nuevo");
  }

  const coloresUsados = colores.filter((c) => coloresSel.includes(c.id));

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl font-medium">Nuevo producto</h1>
        <button onClick={cancelar} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[var(--color-danger)] transition-colors">
          <X size={15} /> Cancelar
        </button>
      </div>

      <div className="flex items-center mb-10">
        {PASOS.map((p, i) => {
          const activo = paso === p.n;
          const completado = paso > p.n;
          const Icon = p.icon;
          return (
            <div key={p.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    completado
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                      : activo
                      ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-light)]"
                      : "border-[var(--color-line)] text-gray-300"
                  }`}
                >
                  {completado ? <Check size={17} /> : <Icon size={17} />}
                </div>
                <span className={`text-xs ${activo ? "text-[var(--color-accent)] font-medium" : "text-gray-400"}`}>{p.label}</span>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`h-px flex-1 mx-2 mb-5 ${completado ? "bg-[var(--color-accent)]" : "bg-[var(--color-line)]"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6">
        {paso === 1 && (
          <div className="space-y-4">
            <select className={inputClass} onChange={(e) => elegirGrupo(Number(e.target.value))}>
              <option value="">Selecciona un grupo...</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
            <input className={`${inputClass} font-mono-data`} placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            <input className={inputClass} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <textarea className={inputClass} placeholder="Descripción" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            <button onClick={crearProducto} className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
              Siguiente <ArrowRight size={15} />
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-6">
            {variantesCreadas.length === 0 ? (
              <>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">1. Elige los colores</p>
                  <div className="flex flex-wrap gap-2">
                    {colores.map((c) => {
                      const sel = coloresSel.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleColor(c.id)}
                          className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-sm border transition-colors ${
                            sel ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-line)] hover:border-[var(--color-accent)]"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ background: c.hex || "#d4d4d4" }} />
                          {c.nombre}
                          {sel && <Check size={13} className="text-[var(--color-accent)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {coloresUsados.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">2. Elige las tallas de cada color</p>
                    <div className="space-y-4">
                      {coloresUsados.map((c) => (
                        <div key={c.id} className="bg-[var(--color-bg)] rounded-lg p-3">
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: c.hex || "#d4d4d4" }} />
                            {c.nombre}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tallas.map((t) => {
                              const sel = (tallasPorColor[c.id] ?? []).includes(t.id);
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => toggleTallaDeColor(c.id, t.id)}
                                  className={`w-9 h-9 rounded-full text-xs border transition-colors ${
                                    sel ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white" : "border-[var(--color-line)] bg-white hover:border-[var(--color-accent)]"
                                  }`}
                                >
                                  {t.sigla}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setPaso(1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-ink)]">
                    <ArrowLeft size={15} /> Atrás
                  </button>
                  <button onClick={generarVariantes} className="bg-[var(--color-ink)] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
                    Generar variantes
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-[var(--color-accent-light)] text-[var(--color-accent)] rounded-lg p-4 text-sm">
                Se crearon {variantesCreadas.length} variantes (precio y stock se cargan en el primer ingreso). Sigamos con las fotos.
              </div>
            )}
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Elige a qué color pertenece la foto antes de subirla — así la tienda muestra la imagen correcta cuando el cliente elige ese color.
            </p>
            <select className={inputClass} value={colorFotoActual} onChange={(e) => setColorFotoActual(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Foto general (no ligada a un color)</option>
              {coloresUsados.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-line)] rounded-lg p-8 cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]/30 transition-colors">
              <ImagePlus size={24} className="text-gray-300 mb-2" />
              <span className="text-sm text-gray-500">{subiendo ? "Subiendo..." : "Haz clic para subir una foto de este color"}</span>
              <input type="file" accept="image/*" className="hidden" disabled={subiendo} onChange={(e) => e.target.files && subirImagen(e.target.files[0])} />
            </label>

            <div className="flex gap-3 flex-wrap">
              {imagenes.map((img) => {
                const colorNombre = coloresUsados.find((c) => c.id === img.colorId)?.nombre;
                return (
                  <div key={img.id} className="text-center">
                    <img src={img.url} className="w-20 h-20 object-cover rounded-md border border-[var(--color-line)]" />
                    <p className="text-[10px] text-gray-400 mt-1">{colorNombre ?? "General"}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setPaso(2)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-ink)]">
                <ArrowLeft size={15} /> Atrás
              </button>
              <button onClick={terminarYAgregarStock} className="flex items-center gap-2 bg-[var(--color-accent)] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Terminar y agregar stock inicial <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}