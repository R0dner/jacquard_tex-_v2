import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const productoId = Number(formData.get("productoId"));
  const principal = formData.get("principal") === "true";
  const colorIdRaw = formData.get("colorId");
  const colorId = colorIdRaw ? Number(colorIdRaw) : null;

  if (!file || !productoId) {
    return NextResponse.json({ error: "Falta el archivo o el productoId" }, { status: 400 });
  }

  const nombreUnico = `${Date.now()}-${file.name}`;
  const blob = await put(`productos/${productoId}/${nombreUnico}`, file, {
    access: "public",
  });

  const imagen = await prisma.productoImagen.create({
    data: { productoId, url: blob.url, principal, colorId },
  });

  return NextResponse.json(imagen, { status: 201 });
}