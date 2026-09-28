import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const colores = await prisma.color.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(colores);
}

export async function POST(req: Request) {
  const { nombre, hex } = await req.json();
  if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  const color = await prisma.color.create({ data: { nombre, hex } });
  return NextResponse.json(color, { status: 201 });
}