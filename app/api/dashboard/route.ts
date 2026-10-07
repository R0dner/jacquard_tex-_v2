import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { expirarReservasVencidas } from "@/lib/reservas";

export async function GET() {
  await expirarReservasVencidas();
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const [totalProductos, variantes, pedidosPendientes, ventasRecientes, movimientosRecientes, pedidosPorEstadoRaw] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    prisma.productoVariante.findMany({
      where: { producto: { activo: true } },
      select: {
        stockActual: true, stockMinimo: true, sku: true,
        producto: { select: { id: true, nombre: true } },
        color: { select: { nombre: true } },
        talla: { select: { sigla: true } },
      },
    }),
    prisma.pedido.count({ where: { estado: { in: ["PENDIENTE", "RESERVADO"] } } }),
    prisma.pedido.findMany({
      where: { estado: { in: ["ENVIADO", "ENTREGADO"] }, fechaPedido: { gte: hace30Dias } },
      select: { total: true, fechaPedido: true, items: { select: { nombreSnapshot: true, cantidad: true } } },
    }),
    prisma.movimientoInventario.findMany({
      take: 5,
      orderBy: { fecha: "desc" },
      include: { registradoPor: { select: { nombre: true } } },
    }),
    prisma.pedido.groupBy({ by: ["estado"], _count: { estado: true } }),
  ]);

  const stockTotal = variantes.reduce((sum, v) => sum + v.stockActual, 0);
  const stockBajo = variantes.filter((v) => v.stockActual <= v.stockMinimo);

  const ventasPorDia: Record<string, number> = {};
  for (const p of ventasRecientes) {
    const dia = p.fechaPedido.toISOString().slice(0, 10);
    ventasPorDia[dia] = (ventasPorDia[dia] ?? 0) + Number(p.total);
  }
  const seriesVentas = Object.entries(ventasPorDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => ({ fecha: fecha.slice(5), total }));

  const conteoProductos: Record<string, number> = {};
  for (const p of ventasRecientes) {
    for (const item of p.items) {
      conteoProductos[item.nombreSnapshot] = (conteoProductos[item.nombreSnapshot] ?? 0) + item.cantidad;
    }
  }
  const topProductos = Object.entries(conteoProductos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));

  const pedidosPorEstado = pedidosPorEstadoRaw.map((p) => ({ estado: p.estado, cantidad: p._count.estado }));

  return NextResponse.json({
    totalProductos,
    stockTotal,
    pedidosPendientes,
    stockBajo: stockBajo.slice(0, 8).map((v) => ({
      sku: v.sku,
      stockActual: v.stockActual,
      stockMinimo: v.stockMinimo,
      productoId: v.producto.id,
      etiqueta: `${v.producto.nombre} — ${v.color?.nombre ?? ""} ${v.talla?.sigla ?? ""}`.trim(),
    })),
    seriesVentas,
    topProductos,
    pedidosPorEstado,
    movimientosRecientes: movimientosRecientes.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      motivo: m.motivo,
      fecha: m.fecha,
      registradoPor: m.registradoPor?.nombre ?? "—",
    })),
  });
}