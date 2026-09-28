import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movimiento = await prisma.movimientoInventario.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { variante: { include: { producto: true } } } } },
  });
  if (!movimiento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of movimiento.items) {
        if (movimiento.tipo === "ENTRADA" && item.variante.stockActual < item.cantidad) {
          throw new Error(`No se puede borrar: ya salió stock de "${item.variante.producto.nombre}" que llegó en este ingreso.`);
        }
        const delta = movimiento.tipo === "ENTRADA" ? -item.cantidad : item.cantidad;
        await tx.productoVariante.update({ where: { id: item.varianteId }, data: { stockActual: { increment: delta } } });
      }
      await tx.movimientoInventario.delete({ where: { id: movimiento.id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}