import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productoId = Number(id);
  const { combinaciones, precioVenta } = await req.json();
  // combinaciones: [{ colorId: number, tallaIds: number[] }]

  const producto = await prisma.producto.findUniqueOrThrow({ where: { id: productoId } });

  const nuevasVariantes = [];
  for (const combo of combinaciones as { colorId: number; tallaIds: number[] }[]) {
    const color = await prisma.color.findUnique({ where: { id: combo.colorId } });
    for (const tallaId of combo.tallaIds) {
      const talla = await prisma.talla.findUnique({ where: { id: tallaId } });
      nuevasVariantes.push({
        productoId,
        colorId: combo.colorId,
        tallaId,
        sku: `${producto.codigo}-${color?.nombre}-${talla?.sigla}`,
        precioVenta: precioVenta ?? 0,
        stockActual: 0,
      });
    }
  }

  if (nuevasVariantes.length > 0) {
    await prisma.productoVariante.createMany({ data: nuevasVariantes, skipDuplicates: true });
  }

  const variantes = await prisma.productoVariante.findMany({
    where: { productoId },
    include: { color: true, talla: true },
  });

  return NextResponse.json(variantes);
}