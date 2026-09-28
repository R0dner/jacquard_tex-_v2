import Link from "next/link";
import {
  LayoutGrid, Shirt, ClipboardList, Boxes, Tags, Palette, Ruler, Users, LogOut, BarChart3,
} from "lucide-react";
import { adminAuth, adminSignOut } from "@/auth-admin";
import { puedeVerSeccion } from "@/lib/permisos";
import { SessionProvider } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutGrid },
  { href: "/admin/productos", label: "Productos", icon: Shirt },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/catalogo/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/catalogo/colores", label: "Colores", icon: Palette },
  { href: "/admin/catalogo/tallas", label: "Tallas", icon: Ruler },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

const ROL_LABEL: Record<string, string> = {
  ADMIN_PRINCIPAL: "Administrador",
  ADMIN_INVENTARIO: "Admin. de inventario",
  VENDEDOR_PREVENTA: "Encargado de preventas",
  VENDEDOR_DESPACHO: "Encargado de despacho",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await adminAuth();
  const rol = (session?.user as any)?.role as string | undefined;
  const navFiltrado = NAV.filter((item) => puedeVerSeccion(rol, item.href));

  return (
    <SessionProvider basePath="/api/auth-admin">
      <div className="flex min-h-screen">
        <aside className="w-60 shrink-0 bg-[var(--color-ink)] text-white flex flex-col">
          <div className="px-5 py-5 border-b border-white/10">
            <span className="font-semibold tracking-tight text-lg">Jacquard Tex</span>
            <p className="text-xs text-white/50 mt-0.5">Panel de administración</p>
          </div>
          <nav className="flex-1 py-3">
            {navFiltrado.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/75 hover:bg-[var(--color-ink-light)] hover:text-white transition-colors"
                >
                  <Icon size={17} strokeWidth={1.75} className="opacity-80" />
                  {item.label}
                </Link>
              );
            })}
            {rol === "ADMIN_PRINCIPAL" && (
              <Link
                href="/admin/reportes"
                className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/75 hover:bg-[var(--color-ink-light)] hover:text-white transition-colors"
              >
                <BarChart3 size={17} strokeWidth={1.75} className="opacity-80" /> Reportes
              </Link>
            )}
          </nav>
          <div className="px-5 py-4 border-t border-white/10 text-xs text-white/40">
            Jacquard Tex © {new Date().getFullYear()}
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-14 border-b border-[var(--color-line)] bg-white flex items-center justify-end px-6 gap-4">
            {session?.user && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-medium">
                    {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="text-right leading-tight">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-[var(--color-accent)]">{ROL_LABEL[rol ?? ""] ?? rol}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-[var(--color-line)]" />
                <form action={async () => { "use server"; await adminSignOut({ redirectTo: "/admin/login" }); }}>
                  <button
                    type="submit"
                    title="Cerrar sesión"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </form>
              </>
            )}
          </header>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}