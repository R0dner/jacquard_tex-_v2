import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

// Sube/reemplaza la imagen del QR de pago. Solo el Administrador Principal
// puede cambiarla (ej. cuando el banco les entregue un QR distinto más
// adelante, basta con subir una imagen nueva aquí — no requiere tocar código).
export async function POST(req: Request) {
  const session = await adminAuth();
  if ((session?.user as any)?.role !== "ADMIN_PRINCIPAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Falta la imagen del QR" }, { status: 400 });
  }

  const nombreUnico = `${Date.now()}-${file.name}`;
  const blob = await put(`configuracion/qr-pago/${nombreUnico}`, file, {
    access: "public",
  });

  const config = await prisma.configuracionPago.upsert({
    where: { id: 1 },
    create: { id: 1, qrImagenUrl: blob.url },
    update: { qrImagenUrl: blob.url },
  });

  return NextResponse.json(config);
}
