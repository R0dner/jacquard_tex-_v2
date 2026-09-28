"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const inputClass =
  "border border-[var(--color-line)] rounded-md px-4 py-3 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-shadow";

export default function ContactoPage() {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("Consulta general");
  const [descripcion, setDescripcion] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreCompleto, tipoMensaje, descripcion }),
    });
    if (!res.ok) return setError((await res.json()).error);
    setEnviado(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
      <div>
        <h1 className="font-display text-4xl font-medium mb-4">Hablemos</h1>
        <p className="text-gray-500 mb-10">¿Tienes una pregunta sobre un pedido o quieres saber más de nuestras prendas? Escríbenos.</p>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center"><Mail size={17} /></div>
            <span className="text-sm">contacto@jacquardtex.com</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center"><Phone size={17} /></div>
            <span className="text-sm">+591 700 00000</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center"><MapPin size={17} /></div>
            <span className="text-sm">La Paz, Bolivia</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-line)] rounded-xl p-7">
        {enviado ? (
          <p className="text-center text-gray-600 py-10">¡Gracias! Te responderemos pronto.</p>
        ) : (
          <form onSubmit={enviar} className="space-y-3">
            {error && <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 rounded-md">{error}</p>}
            <input className={inputClass} placeholder="Tu nombre" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
            <select className={inputClass} value={tipoMensaje} onChange={(e) => setTipoMensaje(e.target.value)}>
              <option>Consulta general</option>
              <option>Estado de un pedido</option>
              <option>Cambios y devoluciones</option>
              <option>Otro</option>
            </select>
            <textarea className={inputClass} placeholder="Tu mensaje" rows={5} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            <button className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] py-3 rounded-full text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Send size={15} /> Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </div>
  );
}