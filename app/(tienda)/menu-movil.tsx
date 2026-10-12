"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

/** Menú desplegable de la tienda para pantallas chicas (< md). */
export function MenuMovil({ nombre }: { nombre: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const link = "block px-6 py-3.5 text-base font-medium border-b border-[var(--color-line)] hover:bg-[var(--color-bg)]";

  return (
    <div className="md:hidden">
      <button
        onClick={() => setAbierto(true)}
        className="p-2 -ml-2 text-[var(--color-ink)]"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Portal: el header tiene backdrop-blur y atraparía al panel fijo dentro de su altura */}
      {abierto &&
        createPortal(
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAbierto(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-line)]">
              <span className="font-display italic text-xl">Jacquard Tex</span>
              <button onClick={() => setAbierto(false)} className="p-2 -mr-2" aria-label="Cerrar menú">
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <Link href="/" className={link}>Inicio</Link>
              <Link href="/productos" className={link}>Tienda</Link>
              <Link href="/nosotros" className={link}>Nosotros</Link>
              <Link href="/contacto" className={link}>Contacto</Link>
              {nombre ? (
                <Link href="/mis-pedidos" className={`${link} flex items-center gap-2`}>
                  <User size={18} /> Mis pedidos ({nombre})
                </Link>
              ) : (
                <Link href="/login" className={`${link} flex items-center gap-2`}>
                  <User size={18} /> Entrar
                </Link>
              )}
            </nav>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
