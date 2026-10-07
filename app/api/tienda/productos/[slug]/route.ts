import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { expirarReservasVencidas } from "@/lib/reservas";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await expirarReservasVencidas();
  const producto = await prisma.producto.findUnique({
    where: { slug },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      variantes: { include: { color: true, talla: true } },
    },
  });
  if (!producto || !producto.activo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(producto);
}