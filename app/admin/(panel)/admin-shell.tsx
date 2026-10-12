"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Shirt, ClipboardList, Boxes, Tags, Palette, Ruler, Users, BarChart3, QrCode, Menu, X,
} from "lucide-react";

const ICONOS = { LayoutGrid, Shirt, ClipboardList, Boxes, Tags, Palette, Ruler, Users, BarChart3, QrCode };

export type NavItem = { href: string; label: string; icon: keyof typeof ICONOS };

/**
 * Marco del panel: en pantallas grandes el menú es una barra lateral fija;
 * en celular/tablet pasa a un cajón que se abre con el botón de hamburguesa.
 */
export function AdminShell({
  items,
  userName,
  rolLabel,
  cerrarSesion,
  children,
}: {
  items: NavItem[];
  userName: string | null;
  rolLabel: string;
  cerrarSesion: React.ReactNode;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  // Cierra el cajón al navegar
  useEffect(() => setAbierto(false), [pathname]);

  // Evita que la página de fondo se desplace con el cajón abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <div className="flex min-h-screen">
      {abierto && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setAbierto(false)} aria-hidden />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-[var(--color-ink)] text-white flex flex-col transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <span className="font-semibold tracking-tight text-lg">Jacquard Tex</span>
            <p className="text-xs text-white/50 mt-0.5">Panel de administración</p>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="lg:hidden p-1 -mr-1 text-white/70 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {items.map((item) => {
            const Icon = ICONOS[item.icon];
            const activo = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-ink-light)] hover:text-white transition-colors ${
                  activo ? "bg-[var(--color-ink-light)] text-white" : "text-white/75"
                }`}
              >
                <Icon size={17} strokeWidth={1.75} className="opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-xs text-white/40">
          Jacquard Tex © {new Date().getFullYear()}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-[var(--color-line)] bg-white flex items-center justify-between px-3 sm:px-6 gap-3 sticky top-0 z-30">
          <button
            onClick={() => setAbierto(true)}
            className="lg:hidden p-2 -ml-1 rounded-md text-gray-600 hover:bg-[var(--color-bg)]"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <span className="lg:hidden font-semibold tracking-tight truncate">Jacquard Tex</span>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {userName !== null && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-medium shrink-0">
                    {userName.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="text-right leading-tight hidden sm:block">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-[var(--color-accent)]">{rolLabel}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-[var(--color-line)]" />
                {cerrarSesion}
              </>
            )}
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
