import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { expirarReservasVencidas } from "@/lib/reservas";

export async function GET() {
  await expirarReservasVencidas();
  const variantes = await prisma.productoVariante.findMany({
    where: { producto: { activo: true } },
    include: { producto: true, color: true, talla: true },
    orderBy: [{ producto: { nombre: "asc" } }, { color: { nombre: "asc" } }],
  });

  const resultado = variantes.map((v) => ({
    sku: v.sku,
    producto: v.producto.nombre,
    color: v.color?.nombre ?? null,
    talla: v.talla?.sigla ?? null,
    stockActual: v.stockActual,
    stockMinimo: v.stockMinimo,
  }));

  return NextResponse.json(resultado);
}