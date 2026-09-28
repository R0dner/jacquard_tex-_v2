import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(usuarios);
}

export async function POST(req: Request) {
  const { nombre, email, password, rol } = await req.json();
  if (!nombre || !email || !password || !rol) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash, rol },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}