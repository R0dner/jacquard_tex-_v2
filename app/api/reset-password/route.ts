import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const registro = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!registro || registro.usado || registro.expiraEn < new Date() || !registro.clienteId) {
    return NextResponse.json({ error: "Link inválido o vencido" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.cliente.update({ where: { id: registro.clienteId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: registro.id }, data: { usado: true } }),
  ]);

  return NextResponse.json({ ok: true });
}