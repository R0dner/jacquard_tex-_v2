"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpCircle, ArrowDownCircle, Plus, X, Save, PackagePlus, Check } from "lucide-react";

type Item = { sku: string; cantidad: number; costoUnitario?: number; precioVenta?: number };
type VarianteOpcion = { sku: string; etiqueta: string };
type VarianteProducto = { sku: string; color: { nombre: string } | null; talla: { sigla: string } | null };
type Producto = { id: number; nombre: string; variantes: VarianteProducto[] };

const inputClass =
  "border border-[var(--color-line)] rounded-md px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

export default function NuevoMovimientoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA">("ENTRADA");
  const [motivo, setMotivo] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [variantesDisponibles, setVariantesDisponibles] = useState<VarianteOpcion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSel, setProductoSel] = useState("");
  const [productoElegido, setProductoElegido] = useState<Producto | null>(null);
  const [variantesCheck, setVariantesCheck] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/variantes").then((r) => r.json()).then(setVariantesDisponibles);
    fetch("/api/productos").then((r) => r.json()).then(setProductos);
  }, []);

  useEffect(() => {
    const skuUrl = searchParams.get("sku");
    if (skuUrl) setItems([{ sku: skuUrl, cantidad: 1 }]);
  }, [searchParams]);

  function actualizarItem(i: number, campo: keyof Item, valor: string | number) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  }

  function elegirProducto(productoId: string) {
    setProductoSel(productoId);
    if (!productoId) {
      setProductoElegido(null);
      return;
    }
    const producto = productos.find((p) => p.id === Number(productoId));
    setProductoElegido(producto ?? null);
    setVariantesCheck([]);
  }

  function toggleVarianteCheck(sku: string) {
    setVariantesCheck((prev) => (prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]));
  }

  function agregarSeleccionadas() {
    const skusExistentes = new Set(items.map((i) => i.sku));
    const nuevasLineas = variantesCheck
      .filter((sku) => !skusExistentes.has(sku))
      .map((sku) => ({ sku, cantidad: 1 }));

    setItems((prev) => [...prev, ...nuevasLineas]);

    setProductoElegido(null);
    setProductoSel("");
    setVariantesCheck([]);
  }

  async function guardar() {
    setError("");
    const itemsValidos = items.filter((i) => i.sku && i.cantidad > 0);
    if (itemsValidos.length === 0) return setError("Agrega al menos un producto con cantidad mayor a 0");

    const res = await fetch("/api/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, motivo, numeroDocumento, items: itemsValidos }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push("/admin/inventario");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-medium">Nuevo movimiento</h1>
          <p className="text-sm text-gray-500 mt-1">Registra una entrada o salida de inventario</p>
        </div>
        <button onClick={() => router.push("/admin/inventario")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[var(--color-danger)] transition-colors">
          <X size={15} /> Cancelar
        </button>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTipo("ENTRADA")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium text-sm transition-colors ${
            tipo === "ENTRADA" ? "border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]" : "border-[var(--color-line)] text-gray-400"
          }`}
        >
          <ArrowUpCircle size={18} /> Entrada
        </button>
        <button
          onClick={() => setTipo("SALIDA")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium text-sm transition-colors ${
            tipo === "SALIDA" ? "border-[var(--color-danger)] bg-[var(--color-danger-light)] text-[var(--color-danger)]" : "border-[var(--color-line)] text-gray-400"
          }`}
        >
          <ArrowDownCircle size={18} /> Salida
        </button>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6 space-y-3">
        <input className={inputClass} placeholder="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <input className={inputClass} placeholder="N° de documento (opcional)" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <PackagePlus size={15} /> Elegir variantes de un producto
        </h2>
        <select className={inputClass} value={productoSel} onChange={(e) => elegirProducto(e.target.value)}>
          <option value="">Elige un producto...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.variantes.length} variantes)</option>
          ))}
        </select>

        {productoElegido && (
          <div className="mt-3 border border-[var(--color-line)] rounded-lg p-4 bg-[var(--color-bg)]">
            <p className="text-xs text-gray-500 mb-2">Marca las combinaciones que quieres agregar:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {productoElegido.variantes.map((v) => {
                const marcada = variantesCheck.includes(v.sku);
                return (
                  <button
                    key={v.sku}
                    onClick={() => toggleVarianteCheck(v.sku)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm border text-left transition-colors ${
                      marcada ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-line)] bg-white"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${marcada ? "bg-[var(--color-accent)] border-[var(--color-accent)]" : "border-gray-300"}`}>
                      {marcada && <Check size={11} className="text-white" />}
                    </span>
                    {v.color?.nombre} {v.talla?.sigla}
                  </button>
                );
              })}
            </div>
            <button
              onClick={agregarSeleccionadas}
              disabled={variantesCheck.length === 0}
              className="bg-[var(--color-ink)] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-40"
            >
              Agregar {variantesCheck.length > 0 ? `(${variantesCheck.length})` : "seleccionadas"}
            </button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-6 mb-4">Productos agregados</h2>
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="text-left bg-[var(--color-bg)] text-xs text-gray-600 uppercase tracking-wide">
                  <th className="p-3 font-semibold">Producto / color / talla</th>
                  <th className="p-3 font-semibold w-20">Cantidad</th>
                  {tipo === "ENTRADA" && <th className="p-3 font-semibold w-24">Costo unit.</th>}
                  {tipo === "ENTRADA" && <th className="p-3 font-semibold w-24">Precio venta</th>}
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="p-3">
                      <input
                        className={inputClass}
                        list="lista-variantes"
                        value={item.sku}
                        onChange={(e) => actualizarItem(i, "sku", e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <input className={inputClass} type="number" value={item.cantidad} onChange={(e) => actualizarItem(i, "cantidad", Number(e.target.value))} />
                    </td>
                    {tipo === "ENTRADA" && (
                      <td className="p-3">
                        <input className={inputClass} type="number" value={item.costoUnitario ?? ""} onChange={(e) => actualizarItem(i, "costoUnitario", Number(e.target.value))} />
                      </td>
                    )}
                    {tipo === "ENTRADA" && (
                      <td className="p-3">
                        <input className={inputClass} type="number" value={item.precioVenta ?? ""} onChange={(e) => actualizarItem(i, "precioVenta", Number(e.target.value))} />
                      </td>
                    )}
                    <td className="p-3">
                      <button
                        onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <datalist id="lista-variantes">
              {variantesDisponibles.map((v) => (
                <option key={v.sku} value={v.sku}>{v.etiqueta}</option>
              ))}
            </datalist>

            <button
              onClick={() => setItems((prev) => [...prev, { sku: "", cantidad: 1 }])}
              className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] font-medium hover:underline"
            >
              <Plus size={15} /> Agregar línea suelta
            </button>
          </>
        )}
      </div>

      <button
        onClick={guardar}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white py-3 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors"
      >
        <Save size={16} /> Registrar movimiento
      </button>
    </div>
  );
}