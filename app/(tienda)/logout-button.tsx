"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  function cerrarSesion() {
    localStorage.removeItem("carrito");
    signOut({ redirectTo: "/" });
  }

  return (
    <button title="Cerrar sesión" onClick={cerrarSesion} className="text-gray-400 hover:text-[var(--color-danger)] transition-colors">
      <LogOut size={17} />
    </button>
  );
}