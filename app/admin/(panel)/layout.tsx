import { LogOut } from "lucide-react";
import { adminAuth, adminSignOut } from "@/auth-admin";
import { puedeVerSeccion } from "@/lib/permisos";
import { SessionProvider } from "next-auth/react";
import { AdminShell, type NavItem } from "./admin-shell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Panel", icon: "LayoutGrid" },
  { href: "/admin/productos", label: "Productos", icon: "Shirt" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "ClipboardList" },
  { href: "/admin/inventario", label: "Inventario", icon: "Boxes" },
  { href: "/admin/catalogo/categorias", label: "Categorías", icon: "Tags" },
  { href: "/admin/catalogo/colores", label: "Colores", icon: "Palette" },
  { href: "/admin/catalogo/tallas", label: "Tallas", icon: "Ruler" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "Users" },
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
  const items: NavItem[] = NAV.filter((item) => puedeVerSeccion(rol, item.href));
  if (rol === "ADMIN_PRINCIPAL") {
    items.push({ href: "/admin/reportes", label: "Reportes", icon: "BarChart3" });
    items.push({ href: "/admin/configuracion/pago", label: "Pago y envíos", icon: "QrCode" });
  }

  return (
    <SessionProvider basePath="/api/auth-admin">
      <AdminShell
        items={items}
        userName={session?.user ? session.user.name ?? "" : null}
        rolLabel={ROL_LABEL[rol ?? ""] ?? rol ?? ""}
        cerrarSesion={
          <form action={async () => { "use server"; await adminSignOut({ redirectTo: "/admin/login" }); }}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors"
            >
              <LogOut size={16} />
            </button>
          </form>
        }
      >
        {children}
      </AdminShell>
    </SessionProvider>
  );
}
