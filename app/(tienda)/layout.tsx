import Link from "next/link";
import { auth, signOut } from "@/auth";
import { User, LogOut, Search } from "lucide-react";
import { CartProvider } from "@/lib/cart-context";
import { CarritoIcono } from "./carrito-icono";
import { AuthSessionProvider } from "./session-provider";
import { LogoutButton } from "./logout-button";
import { MenuMovil } from "./menu-movil";

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AuthSessionProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <div className="bg-[var(--color-ink)] text-white text-[11px] sm:text-xs text-center py-2 px-3 tracking-wide">
            Envío gratis en compras mayores a Bs 300 · Nueva colección disponible
          </div>

          <header className="border-b border-[var(--color-line)] bg-white/90 backdrop-blur sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
              <MenuMovil nombre={session?.user ? session.user.name?.split(" ")[0] ?? "" : null} />
              <Link href="/" className="font-display italic text-xl sm:text-2xl font-medium tracking-tight max-md:mr-auto">
                Jacquard Tex
              </Link>
              <nav className="hidden md:flex items-center gap-9 text-sm font-medium">
                <Link href="/" className="link-underline">Inicio</Link>
                <Link href="/productos" className="link-underline">Tienda</Link>
                <Link href="/nosotros" className="link-underline">Nosotros</Link>
                <Link href="/contacto" className="link-underline">Contacto</Link>
              </nav>
              <div className="flex items-center gap-3 sm:gap-5">
                <button className="text-gray-500 hover:text-[var(--color-ink)] transition-colors hidden sm:block">
                  <Search size={19} />
                </button>
                {session?.user ? (
                  <div className="flex items-center gap-3">
                    <Link href="/mis-pedidos" className="text-sm hidden sm:flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                      <User size={18} /> {session.user.name?.split(" ")[0]}
                    </Link>
                    <LogoutButton />
                  </div>
                ) : (
                  <Link href="/login" className="text-sm hidden md:flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                    <User size={18} /> Entrar
                  </Link>
                )}
                <CarritoIcono />
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="bg-[var(--color-ink)] text-white/70 mt-12 sm:mt-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
              <div className="col-span-2 md:col-span-1">
                <span className="font-display italic text-xl text-white">Jacquard Tex</span>
                <p className="text-sm mt-3 text-white/50 leading-relaxed">
                  Prendas hechas para durar, diseñadas para destacar.
                </p>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Tienda</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/productos" className="hover:text-white transition-colors">Ver colección</Link></li>
                  <li><Link href="/mis-pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Empresa</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
                  <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Síguenos</h4>
                <p className="text-sm text-white/50">Instagram · Facebook · TikTok</p>
              </div>
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-white/30">
              Jacquard Tex © {new Date().getFullYear()} — Todos los derechos reservados
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthSessionProvider>
  );
}