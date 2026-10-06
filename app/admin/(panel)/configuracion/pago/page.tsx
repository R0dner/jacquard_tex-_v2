"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { QrCode, UploadCloud, ShieldAlert, CheckCircle2 } from "lucide-react";

type ConfiguracionPago = {
  qrImagenUrl: string | null;
  banco: string | null;
  numeroCuenta: string | null;
  titular: string | null;
  instrucciones: string | null;
};

const inputClass =
  "border border-[var(--color-line)] rounded-md px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]";

export default function ConfiguracionPagoPage() {
  const { data: session } = useSession();
  const rol = (session?.user as any)?.role;

  const [config, setConfig] = useState<ConfiguracionPago | null>(null);
  const [banco, setBanco] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function cargar() {
    fetch("/api/configuracion/pago")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setBanco(data.banco ?? "");
        setNumeroCuenta(data.numeroCuenta ?? "");
        setTitular(data.titular ?? "");
        setInstrucciones(data.instrucciones ?? "");
      });
  }
  useEffect(cargar, []);

  async function subirQr(file: File) {
    setError("");
    setMensaje("");
    setSubiendo(true);
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/configuracion/pago/qr", { method: "POST", body: data });
    setSubiendo(false);
    if (!res.ok) return setError((await res.json()).error);
    setMensaje("QR actualizado.");
    cargar();
  }

  async function guardarDatos() {
    setError("");
    setMensaje("");
    setGuardando(true);
    const res = await fetch("/api/configuracion/pago", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banco, numeroCuenta, titular, instrucciones }),
    });
    setGuardando(false);
    if (!res.ok) return setError((await res.json()).error);
    setMensaje("Datos guardados.");
  }

  if (rol && rol !== "ADMIN_PRINCIPAL") {
    return (
      <div className="p-8 max-w-xl">
        <div className="bg-[var(--color-warning-light)] text-[var(--color-warning)] rounded-lg p-5 flex items-center gap-3">
          <ShieldAlert size={20} /> No tienes permiso para ver esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium flex items-center gap-2">
          <QrCode size={26} className="text-[var(--color-accent)]" /> Pago por QR
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Esta imagen y estos datos son los que ve el cliente en el checkout de la tienda cuando elige pagar
          por QR/transferencia.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md">{error}</p>}
      {mensaje && (
        <p className="text-sm text-[var(--color-accent)] bg-[var(--color-accent-light)] p-3 rounded-md flex items-center gap-2">
          <CheckCircle2 size={16} /> {mensaje}
        </p>
      )}

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-sm text-gray-700">Imagen del QR</h2>
        <div className="flex items-start gap-5">
          <div className="w-40 h-40 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] flex items-center justify-center overflow-hidden shrink-0">
            {config?.qrImagenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.qrImagenUrl} alt="QR de pago" className="w-full h-full object-contain" />
            ) : (
              <QrCode size={40} className="text-gray-300" />
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) subirQr(file);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              className="flex items-center gap-1.5 bg-[var(--color-ink)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors disabled:opacity-50"
            >
              <UploadCloud size={16} /> {subiendo ? "Subiendo..." : config?.qrImagenUrl ? "Reemplazar QR" : "Subir QR"}
            </button>
            <p className="text-xs text-gray-400 max-w-xs">
              Cuando el banco les entregue un QR nuevo, suban la imagen aquí — se reemplaza al instante en la
              tienda, sin tocar código.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-lg shadow-sm p-6 space-y-3">
        <h2 className="font-medium text-sm text-gray-700">Datos de la cuenta (opcional)</h2>
        <input className={inputClass} placeholder="Banco" value={banco} onChange={(e) => setBanco(e.target.value)} />
        <input className={inputClass} placeholder="Número de cuenta" value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} />
        <input className={inputClass} placeholder="Nombre del titular" value={titular} onChange={(e) => setTitular(e.target.value)} />
        <textarea
          className={inputClass}
          rows={3}
          placeholder="Instrucciones adicionales para el cliente (opcional)"
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
        />
        <button
          onClick={guardarDatos}
          disabled={guardando}
          className="bg-[var(--color-gold)] text-[var(--color-ink)] px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-md transition-all disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar datos"}
        </button>
      </div>
    </div>
  );
}
