import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["ENVIADO", "CANCELADO"],
  ENVIADO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await adminAuth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nuevoEstado } = await req.json();
  const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) }, include: { items: true } });
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const permitidas = TRANSICIONES_VALIDAS[pedido.estado] ?? [];
  if (!permitidas.includes(nuevoEstado)) {
    return NextResponse.json(
      { error: `No se puede pasar de ${pedido.estado} a ${nuevoEstado}` },
      { status: 400 }
    );
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      if (nuevoEstado === "ENVIADO") {
        const itemsMovimiento = [];
        for (const item of pedido.items) {
          if (!item.varianteId) continue;
          const variante = await tx.productoVariante.findUnique({ where: { id: item.varianteId } });
          if (!variante) throw new Error(`Variante no encontrada para ${item.nombreSnapshot}`);
          if (variante.stockActual < item.cantidad) {
            throw new Error(
              `Stock insuficiente para ${item.nombreSnapshot} (disponible: ${variante.stockActual}, pedido: ${item.cantidad})`
            );
          }
          await tx.productoVariante.update({
            where: { id: variante.id },
            data: { stockActual: { decrement: item.cantidad } },
          });
          itemsMovimiento.push({ varianteId: variante.id, cantidad: item.cantidad });
        }

        await tx.movimientoInventario.create({
          data: {
            tipo: "SALIDA",
            motivo: `Venta - Pedido ${pedido.referencia}`,
            estado: "completado",
            aprobado: true,
            registradoPorId: Number((session.user as any).id),
            totalItems: itemsMovimiento.length,
            items: { create: itemsMovimiento },
          },
        });
      }

      return tx.pedido.update({ where: { id: pedido.id }, data: { estado: nuevoEstado } });
    });

    return NextResponse.json(resultado);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}