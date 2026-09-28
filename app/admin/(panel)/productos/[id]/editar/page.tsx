"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ImagePlus, X, Check } from "lucide-react";
import Link from "next/link";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagenes: { id: number; url: string }[];
  variantes: {
    id: number;
    sku: string;
    precioVenta: string;
    stockActual: number;
    stockMinimo: number;
    enOferta: boolean;
    precioOferta: string | null;
    color: { nombre: string } | null;
    talla: { sigla: string } | null;
  }[];
};

const inputClass =
  "border border-[var(--color-line)] rounded-md px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

function Seccion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6">
      <h2 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function EditarProductoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [colores, setColores] = useState<{ id: number; nombre: string; hex: string | null }[]>([]);
  const [tallas, setTallas] = useState<{ id: number; sigla: string }[]>([]);
  const [coloresSel, setColoresSel] = useState<number[]>([]);
  const [tallasSel, setTallasSel] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/productos/${id}`).then((r) => r.json()).then(setProducto);
  }, [id]);

  useEffect(() => {
    fetch("/api/colores").then((r) => r.json()).then(setColores);
    fetch("/api/tallas").then((r) => r.json()).then(setTallas);
  }, []);

  if (!producto) return <p className="p-8 text-gray-400">Cargando...</p>;

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: producto!.nombre, descripcion: producto!.descripcion }),
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  async function subirImagen(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productoId", String(id));
    formData.append("principal", "false");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const nueva = await res.json();
    setProducto((prev) => prev && { ...prev, imagenes: [...prev.imagenes, nueva] });
  }

  async function borrarImagen(imgId: number) {
    await fetch(`/api/imagenes/${imgId}`, { method: "DELETE" });
    setProducto((prev) => prev && { ...prev, imagenes: prev.imagenes.filter((i) => i.id !== imgId) });
  }

  async function actualizarVariante(varId: number, campo: string, valor: string | number | boolean) {
    setProducto((prev) => prev && {
      ...prev,
      variantes: prev.variantes.map((v) => (v.id === varId ? { ...v, [campo]: valor } : v)),
    });
    await fetch(`/api/variantes/${varId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
  }

  async function agregarVariantes() {
    if (coloresSel.length === 0 || tallasSel.length === 0) return;
    await fetch(`/api/productos/${id}/variantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        combinaciones: coloresSel.map((colorId) => ({ colorId, tallaIds: tallasSel })),
      }),
    });
    const actualizado = await fetch(`/api/productos/${id}`).then((r) => r.json());
    setProducto(actualizado);
    setColoresSel([]);
    setTallasSel([]);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium">Editar producto</h1>
          <p className="text-sm text-gray-500 mt-1">{producto.nombre}</p>
        </div>
        <Link href="/admin/productos" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-accent)] transition-colors">
          <ArrowLeft size={15} /> Volver
        </Link>
      </div>

      <Seccion title="Datos generales">
        <form onSubmit={guardarDatos} className="space-y-3">
          <input className={inputClass} value={producto.nombre} onChange={(e) => setProducto({ ...producto, nombre: e.target.value })} />
          <textarea className={inputClass} rows={3} value={producto.descripcion ?? ""} onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })} />
          <button className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
            {guardado ? <><Check size={15} /> Guardado</> : "Guardar"}
          </button>
        </form>
      </Seccion>

      <Seccion title="Fotos">
        <div className="flex gap-3 flex-wrap mb-4">
          {producto.imagenes.map((img) => (
            <div key={img.id} className="relative group">
              <img src={img.url} className="w-20 h-20 object-cover rounded-md border border-[var(--color-line)]" />
              <button
                onClick={() => borrarImagen(img.id)}
                className="absolute -top-2 -right-2 bg-[var(--color-danger)] text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 border-2 border-dashed border-[var(--color-line)] rounded-md flex items-center justify-center cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]/30 transition-colors">
            <ImagePlus size={18} className="text-gray-300" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && subirImagen(e.target.files[0])} />
          </label>
        </div>
      </Seccion>

      <Seccion title="Variantes">
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left bg-[var(--color-bg)] text-xs text-gray-600 uppercase tracking-wide">
              <th className="p-3 font-semibold">Color/Talla</th>
              <th className="p-3 font-semibold">SKU</th>
              <th className="p-3 font-semibold">Precio</th>
              <th className="p-3 font-semibold">Stock</th>
              <th className="p-3 font-semibold">Mínimo</th>
              <th className="p-3 font-semibold">Oferta</th>
            </tr>
          </thead>
          <tbody>
            {producto.variantes.map((v) => (
              <tr key={v.id} className="border-b border-[var(--color-line)] last:border-0">
                <td className="p-3 text-gray-600">{v.color?.nombre} / {v.talla?.sigla}</td>
                <td className="p-3">
                  <input className={`${inputClass} font-mono-data`} defaultValue={v.sku} onBlur={(e) => actualizarVariante(v.id, "sku", e.target.value)} />
                </td>
                <td className="p-3">
                  <input className={inputClass} defaultValue={v.precioVenta} onBlur={(e) => actualizarVariante(v.id, "precioVenta", e.target.value)} />
                </td>
                <td className="p-3 text-gray-500">
                  {v.stockActual} <span className="text-xs text-gray-400 block">(ajustar en Inventario)</span>
                </td>
                <td className="p-3">
                  <input
                    className={`${inputClass} w-16`}
                    type="number"
                    defaultValue={v.stockMinimo}
                    onBlur={(e) => actualizarVariante(v.id, "stockMinimo", Number(e.target.value))}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarVariante(v.id, "enOferta", !v.enOferta)}
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${v.enOferta ? "bg-[var(--color-gold)]" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${v.enOferta ? "translate-x-4" : ""}`} />
                    </button>
                    {v.enOferta && (
                      <input
                        className={`${inputClass} w-24`}
                        placeholder="Precio oferta"
                        defaultValue={v.precioOferta ?? ""}
                        onBlur={(e) => actualizarVariante(v.id, "precioOferta", e.target.value)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-[var(--color-line)] pt-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Agregar color/talla nuevo</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {colores.map((c) => {
              const sel = coloresSel.includes(c.id);
              return (
                <button key={c.id} onClick={() => setColoresSel((prev) => (sel ? prev.filter((cid) => cid !== c.id) : [...prev, c.id]))}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-sm border transition-colors ${sel ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-line)] hover:border-[var(--color-accent)]"}`}>
                  <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ background: c.hex || "#d4d4d4" }} />
                  {c.nombre}
                  {sel && <Check size={13} className="text-[var(--color-accent)]" />}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {tallas.map((t) => {
              const sel = tallasSel.includes(t.id);
              return (
                <button key={t.id} onClick={() => setTallasSel((prev) => (sel ? prev.filter((tid) => tid !== t.id) : [...prev, t.id]))}
                  className={`w-10 h-10 rounded-full text-sm border transition-colors ${sel ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white" : "border-[var(--color-line)] hover:border-[var(--color-accent)]"}`}>
                  {t.sigla}
                </button>
              );
            })}
          </div>
          <button onClick={agregarVariantes} className="bg-[var(--color-ink)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors">
            Generar nuevas combinaciones
          </button>
        </div>
      </Seccion>
    </div>
  );
}