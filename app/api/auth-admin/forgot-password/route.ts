import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Responde igual exista o no el correo (evita que alguien adivine qué correos están registrados)
  if (usuario) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        usuarioId: usuario.id,
        expiraEn: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password/${token}`;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: usuario.email,
      subject: "Recuperar contraseña — Jacquard Tex",
      html: `<p>Hacé clic para elegir una nueva contraseña (válido por 1 hora):</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
  }

  return NextResponse.json({ ok: true });
}