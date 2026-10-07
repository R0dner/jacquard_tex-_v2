import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // deleteMany con clienteId: un cliente solo puede borrar SUS direcciones.
  const res = await prisma.direccionCliente.deleteMany({
    where: { id: Number(id), clienteId: Number((session.user as any).id) },
  });
  if (res.count === 0) return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
