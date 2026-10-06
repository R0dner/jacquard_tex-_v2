import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

// GET es público a propósito: el checkout de la tienda lo consume para
// mostrar el QR y los datos de la cuenta cuando el cliente elige pagar
// por QR/transferencia. No expone nada sensible (solo lo que el admin
// quiere que el cliente vea para poder pagar).
export async function GET() {
  const config = await prisma.configuracionPago.findUnique({ where: { id: 1 } });
  return NextResponse.json(
    config ?? {
      id: 1,
      qrImagenUrl: null,
      banco: null,
      numeroCuenta: null,
      titular: null,
      instrucciones: null,
    }
  );
}

export async function PATCH(req: Request) {
  const session = await adminAuth();
  if ((session?.user as any)?.role !== "ADMIN_PRINCIPAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { banco, numeroCuenta, titular, instrucciones } = await req.json();

  const config = await prisma.configuracionPago.upsert({
    where: { id: 1 },
    create: { id: 1, banco, numeroCuenta, titular, instrucciones },
    update: { banco, numeroCuenta, titular, instrucciones },
  });

  return NextResponse.json(config);
}
