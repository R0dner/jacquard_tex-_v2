import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grupo = await prisma.grupoProducto.findUniqueOrThrow({ where: { id: Number(id) } });

  if (!grupo.prefijoCodigo) return NextResponse.json({ codigo: "" });

  const count = await prisma.producto.count({ where: { grupoId: Number(id) } });
  const codigo = `${grupo.prefijoCodigo}-${String(count + 1).padStart(3, "0")}`;
  return NextResponse.json({ codigo });
}