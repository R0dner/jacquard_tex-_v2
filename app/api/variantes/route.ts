import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const variantes = await prisma.productoVariante.findMany({
    include: { producto: true, color: true, talla: true },
    orderBy: { producto: { nombre: "asc" } },
  });

  const resultado = variantes.map((v) => ({
    sku: v.sku,
    etiqueta: `${v.producto.nombre} — ${v.color?.nombre ?? ""} ${v.talla?.sigla ?? ""} (stock: ${v.stockActual})`,
  }));

  return NextResponse.json(resultado);
}
