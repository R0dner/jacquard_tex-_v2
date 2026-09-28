"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { tienePermiso } from "@/lib/permisos";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  imagenes: { url: string; principal: boolean }[];
  variantes: { stockActual: number }[];
};

export default function ListaProductosPage() {
  const { data: session } = useSession();
  const rol = (session?.user as any)?.role;
  const puedeCrear = tienePermiso(rol, "/admin/productos/nuevo");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  function cargar() {
    fetch("/api/productos").then((r) => r.json()).then((data) => {
      setProductos(data);
      setCargando(false);
    });
  }
  useEffect(cargar, []);

  async function borrar(id: number, nombre: string) {
    if (!confirm(`¿Borrar "${nombre}"? Esto también borra sus fotos y variantes. No se puede deshacer.`)) return;
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    if (!res.ok) return alert((await res.json()).error);
    cargar();
  }

  async function toggleActivo(id: number, activo: boolean) {
    await fetch(`/api/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });
    cargar();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-medium">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">{productos.length} en catálogo</p>
        </div>
        {puedeCrear && (
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-1.5 text-sm bg-[var(--color-ink)] text-white rounded-md px-4 py-2.5 hover:bg-[var(--color-ink-light)] transition-colors"
          >
            <Plus size={16} /> Nuevo producto
          </Link>
        )}
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">
        {cargando ? (
          <p className="p-8 text-sm text-gray-400 text-center">Cargando...</p>
        ) : productos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Todavía no hay productos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-[var(--color-bg)] border-b border-[var(--color-line)] text-xs text-gray-600 uppercase tracking-wide">
                <th className="p-4 font-semibold">Foto</th>
                <th className="p-4 font-semibold">Código</th>
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Stock total</th>
                <th className="p-4 font-semibold">Activo</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, i) => {
                const portada = p.imagenes.find((im) => im.principal) ?? p.imagenes[0];
                const stockTotal = p.variantes.reduce((sum, v) => sum + v.stockActual, 0);
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-accent-light)]/40 transition-colors ${i % 2 === 1 ? "bg-[var(--color-bg)]/50" : ""}`}
                  >
                    <td className="p-4">
                      {portada ? (
                        <img src={portada.url} className="w-14 h-14 object-cover rounded-md" />
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-gray-300">
                          <Package size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono-data text-gray-700 text-base">{p.codigo}</td>
                    <td className="p-4 font-medium text-base">{p.nombre}</td>
                    <td className="p-4">
                      <span className={`font-mono-data px-2.5 py-1 rounded-md text-sm font-medium ${stockTotal === 0 ? "bg-[var(--color-danger-light)] text-[var(--color-danger)]" : "bg-[var(--color-accent-light)] text-[var(--color-accent)]"}`}>
                        {stockTotal}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActivo(p.id, p.activo)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${p.activo ? "bg-[var(--color-accent)]" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${p.activo ? "translate-x-5" : ""}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/admin/productos/${p.id}/editar`}
                          className="w-9 h-9 flex items-center justify-center rounded-md text-gray-400 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] transition-colors"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => borrar(p.id, p.nombre)}
                          className="w-9 h-9 flex items-center justify-center rounded-md text-gray-400 hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}