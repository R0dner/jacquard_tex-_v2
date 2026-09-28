import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre, hex } = await req.json();
  const color = await prisma.color.update({ where: { id: Number(id) }, data: { nombre, hex } });
  return NextResponse.json(color);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.color.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede borrar: hay productos usando este color. Puedes editarlo en vez de borrarlo." },
      { status: 400 }
    );
  }
}