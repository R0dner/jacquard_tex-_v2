import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre, descripcion, activo } = await req.json();
  const categoria = await prisma.categoria.update({
    where: { id: Number(id) },
    data: { nombre, descripcion, activo },
  });
  return NextResponse.json(categoria);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.categoria.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede borrar: hay grupos usando esta categoría. Muévelos o bórralos primero." },
      { status: 400 }
    );
  }
}