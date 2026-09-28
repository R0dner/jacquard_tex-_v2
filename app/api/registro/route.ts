import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nombre, email, password } = await req.json();

  if (!nombre || !email || !password) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const existente = await prisma.cliente.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.cliente.create({
    data: { nombre, email, passwordHash, confirmado: true },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}