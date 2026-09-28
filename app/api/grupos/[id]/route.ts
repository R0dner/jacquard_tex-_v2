import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre, descripcion, prefijoCodigo, categoriaId, activo } = await req.json();
  const grupo = await prisma.grupoProducto.update({
    where: { id: Number(id) },
    data: { nombre, descripcion, prefijoCodigo, categoriaId, activo },
  });
  return NextResponse.json(grupo);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.grupoProducto.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede borrar: hay productos usando este grupo. Muévelos o bórralos primero." },
      { status: 400 }
    );
  }
}
