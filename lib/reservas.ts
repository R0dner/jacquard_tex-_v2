import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export const HORAS_RESERVA = 24;

export function fechaExpiracionReserva(desde = new Date()) {
  return new Date(desde.getTime() + HORAS_RESERVA * 60 * 60 * 1000);
}

/**
 * Saca del inventario las unidades de un pedido (reserva o descuento definitivo).
 * Respeta la regla del kardex: el stock solo cambia a través de un
 * MovimientoInventario, aquí una SALIDA con el motivo indicado.
 * Falla (y la transacción se revierte) si alguna variante no tiene stock suficiente.
 */
export async function descontarStock(
  tx: Tx,
  pedidoId: number,
  motivo: string,
  registradoPorId: number | null
) {
  const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, include: { items: true } });
  if (!pedido) throw new Error("Pedido no encontrado");
  if (pedido.stockDescontado) return;

  const itemsMovimiento: { varianteId: number; cantidad: number }[] = [];
  for (const item of pedido.items) {
    if (!item.varianteId) continue;
    // Condicional: solo descuenta si todavía alcanza. Así dos compras simultáneas
    // de la última unidad no pueden vender mercadería que ya no existe.
    const res = await tx.productoVariante.updateMany({
      where: { id: item.varianteId, stockActual: { gte: item.cantidad } },
      data: { stockActual: { decrement: item.cantidad } },
    });
    if (res.count === 0) {
      const v = await tx.productoVariante.findUnique({ where: { id: item.varianteId } });
      throw new Error(
        `"${item.nombreSnapshot}" ya no tiene stock suficiente (disponible: ${v?.stockActual ?? 0}, pedido: ${item.cantidad})`
      );
    }
    itemsMovimiento.push({ varianteId: item.varianteId, cantidad: item.cantidad });
  }

  if (itemsMovimiento.length > 0) {
    await tx.movimientoInventario.create({
      data: {
        tipo: "SALIDA",
        motivo,
        estado: "completado",
        aprobado: true,
        registradoPorId,
        totalItems: itemsMovimiento.length,
        items: { create: itemsMovimiento },
      },
    });
  }
  await tx.pedido.update({ where: { id: pedidoId }, data: { stockDescontado: true } });
}

/** Devuelve al inventario lo que el pedido había apartado (cancelación o vencimiento). */
export async function devolverStock(tx: Tx, pedidoId: number, motivo: string, registradoPorId: number | null) {
  const pedido = await tx.pedido.findUnique({ where: { id: pedidoId }, include: { items: true } });
  if (!pedido || !pedido.stockDescontado) return;

  const itemsMovimiento: { varianteId: number; cantidad: number }[] = [];
  for (const item of pedido.items) {
    if (!item.varianteId) continue;
    await tx.productoVariante.update({
      where: { id: item.varianteId },
      data: { stockActual: { increment: item.cantidad } },
    });
    itemsMovimiento.push({ varianteId: item.varianteId, cantidad: item.cantidad });
  }

  if (itemsMovimiento.length > 0) {
    await tx.movimientoInventario.create({
      data: {
        tipo: "ENTRADA",
        motivo,
        estado: "completado",
        aprobado: true,
        registradoPorId,
        totalItems: itemsMovimiento.length,
        items: { create: itemsMovimiento },
      },
    });
  }
  await tx.pedido.update({ where: { id: pedidoId }, data: { stockDescontado: false } });
}

/**
 * Cancela las reservas que pasaron las 24 h sin ser confirmadas y devuelve su stock.
 * Se llama antes de cualquier lectura o escritura que dependa del stock (tienda,
 * pedidos, inventario) y además una vez al día desde /api/cron/expirar-reservas.
 * Nunca lanza: si algo falla se registra y la operación que la llamó sigue.
 */
export async function expirarReservasVencidas(): Promise<number> {
  try {
    const vencidas = await prisma.pedido.findMany({
      where: { estado: "RESERVADO", reservaExpiraEn: { lt: new Date() } },
      select: { id: true, referencia: true },
    });

    let liberadas = 0;
    for (const p of vencidas) {
      await prisma.$transaction(async (tx) => {
        // Re-chequea dentro de la transacción: otro proceso pudo confirmarla o cancelarla justo antes.
        const res = await tx.pedido.updateMany({
          where: { id: p.id, estado: "RESERVADO" },
          data: { estado: "CANCELADO", reservaExpiraEn: null },
        });
        if (res.count === 1) {
          await devolverStock(tx, p.id, `Reserva vencida (24 h) - Pedido ${p.referencia}`, null);
          liberadas++;
        }
      });
    }
    return liberadas;
  } catch (e) {
    console.error("expirarReservasVencidas falló:", e);
    return 0;
  }
}
