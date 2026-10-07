import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";
import { descontarStock, devolverStock, expirarReservasVencidas } from "@/lib/reservas";

// PENDIENTE es el estado heredado de antes de las reservas; los pedidos nuevos nacen RESERVADO.
const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  RESERVADO: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["ENVIADO", "CANCELADO"],
  ENVIADO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await adminAuth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const usuarioId = Number((session.user as any).id);

  // Si la reserva ya pasó las 24 h, queda cancelada aquí mismo y esta acción se rechaza abajo.
  await expirarReservasVencidas();

  const { nuevoEstado } = await req.json();
  const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const permitidas = TRANSICIONES_VALIDAS[pedido.estado] ?? [];
  if (!permitidas.includes(nuevoEstado)) {
    const motivo =
      pedido.estado === "CANCELADO"
        ? "El pedido está cancelado (si era una reserva, venció a las 24 h y su stock ya volvió al inventario)"
        : `No se puede pasar de ${pedido.estado} a ${nuevoEstado}`;
    return NextResponse.json({ error: motivo }, { status: 400 });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      if (nuevoEstado === "CANCELADO") {
        // Devuelve al inventario lo que el pedido tenía apartado (si ya había descontado).
        await devolverStock(tx, pedido.id, `Pedido cancelado - ${pedido.referencia}`, usuarioId);
      } else if (!pedido.stockDescontado) {
        // Pedidos heredados (estado PENDIENTE) que nunca apartaron stock: se descuenta al aprobarlos.
        await descontarStock(tx, pedido.id, `Venta - Pedido ${pedido.referencia}`, usuarioId);
      }

      return tx.pedido.update({
        where: { id: pedido.id },
        data: { estado: nuevoEstado, reservaExpiraEn: null },
      });
    }, { timeout: 20000, maxWait: 10000 });

    return NextResponse.json(resultado);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
