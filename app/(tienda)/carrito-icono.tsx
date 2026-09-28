"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CarritoIcono() {
  const { cantidadTotal } = useCart();
  return (
    <Link href="/carrito" className="relative">
      <ShoppingBag size={20} />
      {cantidadTotal > 0 && (
        <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {cantidadTotal}
        </span>
      )}
    </Link>
  );
}