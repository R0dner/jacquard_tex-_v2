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
  const productos = await prisma.producto.findMany({
    include: {
      imagenes: true,
      variantes: { include: { color: true, talla: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(productos);
}

export async function POST(req: Request) {
  const { codigo, nombre, descripcion, grupoId } = await req.json();

  if (!codigo || !nombre) {
    return NextResponse.json({ error: "Código y nombre son obligatorios" }, { status: 400 });
  }

  const producto = await prisma.producto.create({
    data: {
      codigo,
      nombre,
      descripcion,
      slug: slugify(nombre),
      grupoId: grupoId ?? null,
    },
  });

  return NextResponse.json(producto, { status: 201 });
}