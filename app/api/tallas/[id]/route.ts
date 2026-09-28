import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sigla, descripcion, orden } = await req.json();
  const talla = await prisma.talla.update({ where: { id: Number(id) }, data: { sigla, descripcion, orden } });
  return NextResponse.json(talla);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.talla.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede borrar: hay productos usando esta talla. Puedes editarla en vez de borrarla." },
      { status: 400 }
    );
  }
}