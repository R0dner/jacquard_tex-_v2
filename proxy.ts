import { adminAuth } from "@/auth-admin";
import { tienePermiso } from "@/lib/permisos";
import { NextResponse } from "next/server";

export const proxy = adminAuth((req) => {
  const logueado = !!req.auth;
  const path = req.nextUrl.pathname;
  const esPaginaPublica =
    path === "/admin/login" ||
    path === "/admin/forgot-password" ||
    path.startsWith("/admin/reset-password/");

  if (!logueado && !esPaginaPublica) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  if (logueado && !esPaginaPublica) {
    const rol = (req.auth?.user as any)?.role;
    if (!tienePermiso(rol, path)) {
      return NextResponse.redirect(new URL("/admin?sinPermiso=1", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};