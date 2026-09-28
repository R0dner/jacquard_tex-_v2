import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const colorId = searchParams.get("color");
  const tallaId = searchParams.get("talla");
  const categoriaId = searchParams.get("categoria");

  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      ...(categoriaId && { grupo: { categoriaId: Number(categoriaId) } }),
      ...(colorId || tallaId
        ? {
            variantes: {
              some: {
                ...(colorId && { colorId: Number(colorId) }),
                ...(tallaId && { tallaId: Number(tallaId) }),
              },
            },
          }
        : {}),
    },
    include: { imagenes: true, variantes: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(productos);
}