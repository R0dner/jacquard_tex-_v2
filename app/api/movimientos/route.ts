import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await adminAuth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { tipo, motivo, numeroDocumento, items } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Agrega al menos un producto" }, { status: 400 });
  }

  try {
    const movimiento = await prisma.$transaction(async (tx) => {
      let totalCosto = 0;
      const itemsData = [];

      for (const item of items) {
        const variante = await tx.productoVariante.findUnique({ where: { sku: item.sku } });
        if (!variante) throw new Error(`SKU no encontrado: ${item.sku}`);

        if (tipo === "SALIDA" && variante.stockActual < item.cantidad) {
          throw new Error(`Stock insuficiente para ${item.sku} (disponible: ${variante.stockActual})`);
        }

        const dataUpdate: any = {
          stockActual: { [tipo === "ENTRADA" ? "increment" : "decrement"]: item.cantidad },
        };
        if (tipo === "ENTRADA") {
          if (item.costoUnitario) dataUpdate.precioCosto = item.costoUnitario;
          if (item.precioVenta) dataUpdate.precioVenta = item.precioVenta;
        }
        await tx.productoVariante.update({ where: { id: variante.id }, data: dataUpdate });

        itemsData.push({
          varianteId: variante.id,
          cantidad: item.cantidad,
          costoUnitario: item.costoUnitario ?? null,
        });
        totalCosto += (item.costoUnitario ?? 0) * item.cantidad;
      }

      return tx.movimientoInventario.create({
        data: {
          tipo,
          motivo,
          numeroDocumento,
          estado: "completado",
          aprobado: true,
          registradoPorId: Number((session.user as any).id),
          totalItems: items.length,
          totalCosto: tipo === "ENTRADA" ? totalCosto : null,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(movimiento, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function GET() {
  const movimientos = await prisma.movimientoInventario.findMany({
    include: {
      items: { include: { variante: { include: { producto: true, color: true, talla: true } } } },
      registradoPor: true,
    },
    orderBy: { fecha: "desc" },
    take: 50,
  });
  return NextResponse.json(movimientos);
}