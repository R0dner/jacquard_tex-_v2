"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { MapPin, CreditCard, CheckCircle2 } from "lucide-react";

const inputClass =
  "border border-[var(--color-line)] rounded-md px-4 py-3 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, total, vaciar } = useCart();
  const router = useRouter();

  const [nombreInvitado, setNombreInvitado] = useState("");
  const [telefonoInvitado, setTelefonoInvitado] = useState("");
  const [emailInvitado, setEmailInvitado] = useState("");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const METODOS = [
    { valor: "efectivo", label: "Contra entrega" },
    { valor: "transferencia", label: "Transferencia" },
    { valor: "tarjeta", label: "Tarjeta" },
  ];

  async function confirmarPedido() {
    setError("");
    setCargando(true);
    const res = await fetch("/api/tienda/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ sku: i.sku, cantidad: i.cantidad })),
        metodoPago, direccionEnvio, nombreInvitado, telefonoInvitado, emailInvitado,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setCargando(false);
      return;
    }
    vaciar();
    router.push(`/pedido-confirmado?ref=${data.referencia}`);
  }

  if (items.length === 0) {
    return <p className="text-center py-32 text-gray-400">Tu carrito está vacío.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="font-display text-4xl font-medium mb-10">Finalizar compra</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-4 rounded-md">{error}</p>}

          {!session?.user && (
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
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold">
                {session?.user ? "1" : "2"}
              </span>
              <MapPin size={16} className="text-[var(--color-accent)]" /> Dirección de envío
            </h2>
            <textarea className={inputClass} placeholder="Calle, número, referencia, ciudad" rows={2} value={direccionEnvio} onChange={(e) => setDireccionEnvio(e.target.value)} required />
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-xl p-6">
            <h2 className="font-medium flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold">
                {session?.user ? "2" : "3"}
              </span>
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
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-[var(--color-line)] mb-6">
              <span>Total</span>
              <span className="font-mono-data">Bs {total.toFixed(2)}</span>
            </div>
            <button
              onClick={confirmarPedido}
              disabled={cargando || !direccionEnvio}
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