"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type ItemCarrito = {
  sku: string;
  nombre: string;
  color: string | null;
  talla: string | null;
  precio: number;
  cantidad: number;
  imagen: string | null;
  stockDisponible: number;
};

type CartContextType = {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => void;
  quitar: (sku: string) => void;
  actualizarCantidad: (sku: string, cantidad: number) => void;
  vaciar: () => void;
  total: number;
  cantidadTotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem("carrito");
    if (guardado) setItems(JSON.parse(guardado));
    setListo(true);
  }, []);

  useEffect(() => {
    if (listo) localStorage.setItem("carrito", JSON.stringify(items));
  }, [items, listo]);

  function agregar(nuevo: ItemCarrito) {
    setItems((prev) => {
      const existente = prev.find((i) => i.sku === nuevo.sku);
      if (existente) {
        return prev.map((i) =>
          i.sku === nuevo.sku ? { ...i, cantidad: Math.min(i.cantidad + nuevo.cantidad, i.stockDisponible) } : i
        );
      }
      return [...prev, nuevo];
    });
  }

  function quitar(sku: string) {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }

  function actualizarCantidad(sku: string, cantidad: number) {
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, cantidad } : i)));
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregar, quitar, actualizarCantidad, vaciar, total, cantidadTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}