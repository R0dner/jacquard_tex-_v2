import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const categorias = await prisma.categoria.findMany({
    include: { grupos: true },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(categorias);
}

export async function POST(req: Request) {
  const { nombre, descripcion } = await req.json();
  if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  const categoria = await prisma.categoria.create({
    data: { nombre, descripcion, slug: slugify(nombre) },
  });
  return NextResponse.json(categoria, { status: 201 });
}