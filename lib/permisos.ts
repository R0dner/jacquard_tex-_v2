export type Rol = "ADMIN_PRINCIPAL" | "ADMIN_INVENTARIO" | "VENDEDOR_PREVENTA" | "VENDEDOR_DESPACHO";

const RUTAS_POR_ROL: Record<Rol, string[]> = {
  ADMIN_PRINCIPAL: ["*"],
  ADMIN_INVENTARIO: [
    "/admin",
    "/admin/productos",
    "/admin/productos/nuevo",
    "/admin/productos/:id/editar",
    "/admin/inventario",
    "/admin/inventario/nuevo",
    "/admin/catalogo/categorias",
    "/admin/catalogo/colores",
    "/admin/catalogo/tallas",
  ],
  VENDEDOR_PREVENTA: [
    "/admin",
    "/admin/productos",
    "/admin/pedidos",
    "/admin/pedidos/nuevo",
  ],
  VENDEDOR_DESPACHO: [
    "/admin",
    "/admin/productos",
    "/admin/pedidos",
    "/admin/inventario",
    "/admin/inventario/nuevo",
  ],
};

function coincide(patron: string, ruta: string) {
  const patronPartes = patron.split("/").filter(Boolean);
  const rutaPartes = ruta.split("/").filter(Boolean);
  if (patronPartes.length !== rutaPartes.length) return false;
  return patronPartes.every((p, i) => p.startsWith(":") || p === rutaPartes[i]);
}

export function tienePermiso(rol: string | undefined, ruta: string): boolean {
  const permitidas = RUTAS_POR_ROL[rol as Rol];
  if (!permitidas) return false;
  if (permitidas.includes("*")) return true;
  return permitidas.some((patron) => coincide(patron, ruta));
}

export function puedeVerSeccion(rol: string | undefined, href: string): boolean {
  return tienePermiso(rol, href);
}