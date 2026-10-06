import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Público a propósito: lo llama el checkout justo después de crear el
// pedido (POST /api/tienda/pedidos), para adjuntar la foto/captura del
// comprobante de pago por QR. Solo acepta subir el comprobante UNA vez
// por pedido (si ya tiene uno, se rechaza) para que nadie pueda
// sobrescribir el comprobante de un pedido ajeno solo adivinando la referencia.
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const referencia = formData.get("referencia") as string | null;

  if (!file || !referencia) {
    return NextResponse.json({ error: "Falta el archivo o la referencia del pedido" }, { status: 400 });
  }

  const pedido = await prisma.pedido.findUnique({ where: { referencia } });
  if (!pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  if (pedido.comprobanteUrl) {
    return NextResponse.json({ error: "Este pedido ya tiene un comprobante adjunto" }, { status: 400 });
  }

  const nombreUnico = `${Date.now()}-${file.name}`;
  const blob = await put(`comprobantes/${referencia}/${nombreUnico}`, file, {
    access: "public",
  });

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { comprobanteUrl: blob.url },
  });

  return NextResponse.json({ comprobanteUrl: blob.url }, { status: 201 });
}
