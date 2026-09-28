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
  const grupos = await prisma.grupoProducto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(grupos);
}

export async function POST(req: Request) {
  const { nombre, descripcion, prefijoCodigo, categoriaId } = await req.json();
  if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  const grupo = await prisma.grupoProducto.create({
    data: { nombre, descripcion, prefijoCodigo, categoriaId, slug: slugify(nombre) },
  });
  return NextResponse.json(grupo, { status: 201 });
}