import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const colores = await prisma.color.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(colores);
}