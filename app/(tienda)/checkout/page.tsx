"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { MapPin, CreditCard, CheckCircle2, QrCode, UploadCloud, FileCheck2, Truck, Trash2, Clock } from "lucide-react";

const inputClass =
  "border border-[var(--color-line)] rounded-md px-4 py-3 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

type ConfiguracionPago = {
  qrImagenUrl: string | null;
  banco: string | null;
  numeroCuenta: string | null;
  titular: string | null;
  instrucciones: string | null;
};
type Tarifa = { id: number; departamento: string; costo: number };
type DireccionGuardada = { id: number; direccion: string; departamento: string | null; predeterminada: boolean };

const NUEVA = "nueva";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, total, vaciar } = useCart();
  const router = useRouter();

  const [nombreInvitado, setNombreInvitado] = useState("");
  const [telefonoInvitado, setTelefonoInvitado] = useState("");
  const [emailInvitado, setEmailInvitado] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Envío (opcional)
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [conEnvio, setConEnvio] = useState(false);
  const [departamento, setDepartamento] = useState("");
  const [direccionEnvio, setDireccionEnvio] = useState("");

  // Direcciones guardadas (solo clientes con sesión)
  const [guardadas, setGuardadas] = useState<DireccionGuardada[]>([]);
  const [direccionSel, setDireccionSel] = useState<number | typeof NUEVA>(NUEVA);
  const [guardarDireccion, setGuardarDireccion] = useState(true);

  const [configPago, setConfigPago] = useState<ConfiguracionPago | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const comprobanteInputRef = useRef<HTMLInputElement>(null);

  const usuarioLogueado = !!session?.user;

  useEffect(() => {
    fetch("/api/configuracion/pago").then((r) => r.json()).then(setConfigPago);
    fetch("/api/configuracion/envios").then((r) => r.json()).then((d) => setTarifas(Array.isArray(d) ? d : []));
  }, []);

  function cargarGuardadas(seleccionarPredeterminada: boolean) {
    fetch("/api/tienda/direcciones")
      .then((r) => r.json())
      .then((data) => {
        const lista: DireccionGuardada[] = Array.isArray(data) ? data : [];
        setGuardadas(lista);
        if (seleccionarPredeterminada && lista.length > 0) {
          const d = lista.find((x) => x.predeterminada) ?? lista[0];
          setDireccionSel(d.id);
          setDireccionEnvio(d.direccion);
          if (d.departamento) setDepartamento(d.departamento);
        }
        if (lista.length === 0) setDireccionSel(NUEVA);
      });
  }

  useEffect(() => {
    if (usuarioLogueado) cargarGuardadas(true);
  }, [usuarioLogueado]);

  function elegirDireccion(valor: number | typeof NUEVA) {
    setDireccionSel(valor);
    if (valor === NUEVA) {
      setDireccionEnvio("");
      return;
    }
    const d = guardadas.find((x) => x.id === valor);
    if (d) {
      setDireccionEnvio(d.direccion);
      if (d.departamento) setDepartamento(d.departamento);
    }
  }

  async function borrarDireccion(id: number) {
    if (!confirm("¿Borrar esta dirección guardada?")) return;
    await fetch(`/api/tienda/direcciones/${id}`, { method: "DELETE" });
    if (direccionSel === id) {
      setDireccionSel(NUEVA);
      setDireccionEnvio("");
    }
    cargarGuardadas(false);
  }

  const METODOS = [
    { valor: "efectivo", label: "Contra entrega" },
    { valor: "qr", label: "QR / Transferencia" },
    { valor: "tarjeta", label: "Tarjeta" },
  ];

  const tarifaSel = tarifas.find((t) => t.departamento === departamento);
  const costoEnvio = conEnvio && tarifaSel ? tarifaSel.costo : 0;
  const totalPagar = total + costoEnvio;

  const envioIncompleto = conEnvio && (!departamento || !direccionEnvio.trim());
  const usandoNueva = direccionSel === NUEVA;

  async function confirmarPedido() {
    setError("");
    if (envioIncompleto) {
      setError("Para el envío elige el departamento y escribe la dirección.");
      return;
    }
    if (metodoPago === "qr" && !comprobante) {
      setError("Adjunta la captura de tu comprobante de pago para continuar.");
      return;
    }

    setCargando(true);
    const res = await fetch("/api/tienda/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ sku: i.sku, cantidad: i.cantidad })),
        metodoPago,
        conEnvio,
        departamentoEnvio: conEnvio ? departamento : null,
        direccionEnvio: conEnvio ? direccionEnvio : null,
        guardarDireccion: conEnvio && usuarioLogueado && usandoNueva && guardarDireccion,
        nombreInvitado, telefonoInvitado, emailInvitado,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setCargando(false);
      return;
    }

    if (metodoPago === "qr" && comprobante) {
      try {
        const form = new FormData();
        form.append("file", comprobante);
        form.append("referencia", data.referencia);
        await fetch("/api/tienda/pedidos/comprobante", { method: "POST", body: form });
      } catch {
        // El pedido ya se creó correctamente; si falla solo la subida del
        // comprobante, no bloqueamos la compra — el administrador puede
        // pedirlo de vuelta por otro medio si hace falta.
      }
    }

    vaciar();
    router.push(`/pedido-confirmado?ref=${data.referencia}`);
  }

  if (items.length === 0) {
    return <p className="text-center py-32 text-gray-400">Tu carrito está vacío.</p>;
  }

  const numEnvio = usuarioLogueado ? 1 : 2;
  const numPago = numEnvio + 1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="font-display text-4xl font-medium mb-10">Finalizar compra</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 rounded-md">{error}</p>}

          {!usuarioLogueado && (
            <div className="bg-white border border-[var(--color-line)] rounded-xl p-6">
              <h2 className="font-medium flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold">1</span>
                Tus datos
              </h2>
              <div className="space-y-3">
                <input className={inputClass} placeholder="Nombre completo" value={nombreInvitado} onChange={(e) => setNombreInvitado(e.target.value)} required />
                <input className={inputClass} placeholder="Teléfono" value={telefonoInvitado} onChange={(e) => setTelefonoInvitado(e.target.value)} required />
                <input className={inputClass} placeholder="Correo (opcional)" value={emailInvitado} onChange={(e) => setEmailInvitado(e.target.value)} />
              </div>
            </div>
          )}

          <div className="bg-white border border-[var(--color-line)] rounded-xl p-6">
            <h2 className="font-medium flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold">{numEnvio}</span>
              <Truck size={16} className="text-[var(--color-accent)]" /> Envío <span className="text-xs font-normal text-gray-400">(opcional)</span>
            </h2>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={conEnvio}
                onChange={(e) => setConEnvio(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              <span className="text-sm font-medium">Quiero que me lo envíen</span>
            </label>
            {!conEnvio && <p className="text-xs text-gray-400 mt-2 ml-7">Sin envío: coordinamos el recojo contigo.</p>}

            {conEnvio && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">Departamento</label>
                  <select className={inputClass} value={departamento} onChange={(e) => setDepartamento(e.target.value)}>
                    <option value="">Elige un departamento…</option>
                    {tarifas.map((t) => (
                      <option key={t.id} value={t.departamento}>
                        {t.departamento} — envío Bs {t.costo.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {usuarioLogueado && guardadas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                      <MapPin size={12} /> Tus direcciones guardadas
                    </p>
                    {guardadas.map((d) => (
                      <div
                        key={d.id}
                        className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                          direccionSel === d.id ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-line)] hover:border-[var(--color-accent)]/40"
                        }`}
                        onClick={() => elegirDireccion(d.id)}
                      >
                        <input type="radio" checked={direccionSel === d.id} onChange={() => elegirDireccion(d.id)} className="mt-1 accent-[var(--color-accent)]" />
                        <div className="flex-1 text-sm">
                          <p>{d.direccion}</p>
                          {d.departamento && <p className="text-xs text-gray-500 mt-0.5">{d.departamento}</p>}
                        </div>
                        <button
                          type="button"
                          title="Borrar dirección"
                          onClick={(e) => { e.stopPropagation(); borrarDireccion(d.id); }}
                          className="text-gray-300 hover:text-[var(--color-danger)] transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    <label
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer text-sm transition-colors ${
                        usandoNueva ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-line)] hover:border-[var(--color-accent)]/40"
                      }`}
                    >
                      <input type="radio" checked={usandoNueva} onChange={() => elegirDireccion(NUEVA)} className="accent-[var(--color-accent)]" />
                      Usar otra dirección
                    </label>
                  </div>
                )}

                {usandoNueva && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 block">Dirección de envío</label>
                      <textarea className={inputClass} placeholder="Calle, número, referencia, ciudad" rows={2} value={direccionEnvio} onChange={(e) => setDireccionEnvio(e.target.value)} />
                    </div>
                    {usuarioLogueado && (
                      <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={guardarDireccion} onChange={(e) => setGuardarDireccion(e.target.checked)} className="w-4 h-4 accent-[var(--color-accent)]" />
                        Guardar esta dirección para mis próximas compras
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-xl p-6">
            <h2 className="font-medium flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold">{numPago}</span>
              <CreditCard size={16} className="text-[var(--color-accent)]" /> Método de pago
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {METODOS.map((m) => (
                <button
                  key={m.valor}
                  onClick={() => setMetodoPago(m.valor)}
                  className={`py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                    metodoPago === m.valor
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-md scale-[1.02]"
                      : "border-[var(--color-line)] bg-white text-gray-500 hover:border-[var(--color-accent)]/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {metodoPago === "qr" && (
              <div className="mt-5 bg-[var(--color-bg)] rounded-xl p-5 flex flex-col sm:flex-row gap-5">
                <div className="w-40 h-40 rounded-lg border border-[var(--color-line)] bg-white flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
                  {configPago?.qrImagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={configPago.qrImagenUrl} alt="QR de pago" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode size={36} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  <p className="font-semibold">
                    Escanea el QR o transfiere <span className="font-mono-data">Bs {totalPagar.toFixed(2)}</span>
                    {costoEnvio > 0 && <span className="block text-xs font-normal text-gray-500">Incluye Bs {costoEnvio.toFixed(2)} de envío</span>}
                  </p>
                  {(configPago?.banco || configPago?.numeroCuenta || configPago?.titular) && (
                    <div className="text-gray-600 space-y-0.5">
                      {configPago?.banco && <p>Banco: {configPago.banco}</p>}
                      {configPago?.numeroCuenta && <p>Cuenta: {configPago.numeroCuenta}</p>}
                      {configPago?.titular && <p>Titular: {configPago.titular}</p>}
                    </div>
                  )}
                  {configPago?.instrucciones && <p className="text-gray-500 text-xs">{configPago.instrucciones}</p>}

                  <input
                    ref={comprobanteInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => comprobanteInputRef.current?.click()}
                    className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium border-2 transition-colors ${
                      comprobante
                        ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-light)]"
                        : "border-dashed border-[var(--color-line)] text-gray-500 hover:border-[var(--color-accent)]/40"
                    }`}
                  >
                    {comprobante ? <FileCheck2 size={16} /> : <UploadCloud size={16} />}
                    {comprobante ? comprobante.name : "Adjuntar comprobante de pago"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-[var(--color-bg)] rounded-xl p-6 sticky top-24">
            <h2 className="font-medium mb-4">Tu pedido</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-auto">
              {items.map((i) => (
                <div key={i.sku} className="flex justify-between text-sm">
                  <span className="text-gray-600">{i.nombre} × {i.cantidad}</span>
                  <span className="font-mono-data">Bs {(i.precio * i.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-4 border-t border-[var(--color-line)] text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono-data">Bs {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío{conEnvio && departamento ? ` (${departamento})` : ""}</span>
                <span className="font-mono-data">
                  {!conEnvio ? "Sin envío" : tarifaSel ? `Bs ${tarifaSel.costo.toFixed(2)}` : "—"}
                </span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t border-[var(--color-line)] mb-5">
              <span>Total a pagar</span>
              <span className="font-mono-data">Bs {totalPagar.toFixed(2)}</span>
            </div>

            <p className="flex items-start gap-2 text-xs text-gray-500 mb-5">
              <Clock size={13} className="shrink-0 mt-0.5" />
              Al confirmar, tus prendas quedan reservadas por 24 horas mientras validamos tu pedido.
            </p>

            <button
              onClick={confirmarPedido}
              disabled={cargando || envioIncompleto || (metodoPago === "qr" && !comprobante)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] py-3.5 rounded-full text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:translate-y-0"
            >
              <CheckCircle2 size={16} /> {cargando ? "Procesando..." : "Confirmar pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
