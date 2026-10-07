import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Direcciones guardadas del cliente que inició sesión. Los invitados no tienen ninguna.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);

  const direcciones = await prisma.direccionCliente.findMany({
    where: { clienteId: Number((session.user as any).id) },
    orderBy: [{ predeterminada: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(direcciones);
}
