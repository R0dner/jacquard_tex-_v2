import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await adminAuth();
  if ((session?.user as any)?.role !== "ADMIN_PRINCIPAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const usuarioId = searchParams.get("usuarioId");

  const pedidos = await prisma.pedido.findMany({
    where: {
      estado: { in: ["CONFIRMADO", "ENVIADO", "ENTREGADO"] },
      ...(desde && { fechaPedido: { gte: new Date(desde) } }),
      ...(hasta && { fechaPedido: { lte: new Date(hasta) } }),
      ...(usuarioId && { registradoPorId: Number(usuarioId) }),
    },
    include: { registradoPor: true, cliente: true, items: true },
    orderBy: { fechaPedido: "desc" },
  });

  const porUsuario: Record<string, { nombre: string; pedidos: typeof pedidos; total: number }> = {};
  for (const p of pedidos) {
    const key = p.registradoPor ? `usuario-${p.registradoPor.id}` : "tienda-online";
    const nombre = p.registradoPor?.nombre ?? "Ventas online (sin vendedor)";
    if (!porUsuario[key]) porUsuario[key] = { nombre, pedidos: [], total: 0 };
    porUsuario[key].pedidos.push(p);
    porUsuario[key].total += Number(p.total);
  }

  return NextResponse.json({ porUsuario, totalGeneral: pedidos.reduce((s, p) => s + Number(p.total), 0) });
}