import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre, rol, activo } = await req.json();
  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: { nombre, rol, activo },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });
  return NextResponse.json(usuario);
}