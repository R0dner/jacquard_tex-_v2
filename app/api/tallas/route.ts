import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tallas = await prisma.talla.findMany({ orderBy: { orden: "asc" } });
  return NextResponse.json(tallas);
}

export async function POST(req: Request) {
  const { sigla, descripcion, orden } = await req.json();
  if (!sigla) return NextResponse.json({ error: "La sigla es obligatoria" }, { status: 400 });
  const talla = await prisma.talla.create({ data: { sigla, descripcion, orden: orden ?? 0 } });
  return NextResponse.json(talla, { status: 201 });
}