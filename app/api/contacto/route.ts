import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nombreCompleto, tipoMensaje, descripcion } = await req.json();

  if (!nombreCompleto || !descripcion) {
    return NextResponse.json({ error: "Completa tu nombre y mensaje" }, { status: 400 });
  }

  await prisma.mensaje.create({
    data: { nombreCompleto, tipoMensaje, descripcion },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}