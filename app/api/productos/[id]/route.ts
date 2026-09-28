import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: { variantes: { include: { color: true, talla: true } }, imagenes: true },
  });
  if (!producto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(producto);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const producto = await prisma.producto.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json(producto);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.producto.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede borrar: ya tiene movimientos de inventario o pedidos registrados. Desactívalo en su lugar (el interruptor de la lista)." },
      { status: 400 }
    );
  }
}