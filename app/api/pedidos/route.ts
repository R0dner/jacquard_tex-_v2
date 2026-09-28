import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

export async function GET() {
  const pedidos = await prisma.pedido.findMany({
    include: { cliente: true, registradoPor: true, items: true },
    orderBy: { fechaPedido: "desc" },
  });
  return NextResponse.json(pedidos);
}

export async function POST(req: Request) {
  const session = await adminAuth();
  const { nombreInvitado, telefonoInvitado, emailInvitado, metodoPago, items } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Agrega al menos un producto" }, { status: 400 });
  }
  if (!nombreInvitado) {
    return NextResponse.json({ error: "El nombre del cliente es obligatorio" }, { status: 400 });
  }

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const itemsData = [];

      for (const item of items) {
        const variante = await tx.productoVariante.findUnique({
          where: { sku: item.sku },
          include: { producto: true, color: true, talla: true },
        });
        if (!variante) throw new Error(`SKU no encontrado: ${item.sku}`);

        const precioUnitario = Number(variante.precioVenta);
        const cantidadSubtotal = precioUnitario * item.cantidad;
        subtotal += cantidadSubtotal;

        itemsData.push({
          varianteId: variante.id,
          productoId: variante.productoId,
          nombreSnapshot: variante.producto.nombre,
          colorSnapshot: variante.color?.nombre ?? null,
          tallaSnapshot: variante.talla?.sigla ?? null,
          precioUnitario,
          cantidad: item.cantidad,
          subtotal: cantidadSubtotal,
        });
      }

      const count = await tx.pedido.count();
      const referencia = `PED-${String(count + 1).padStart(5, "0")}`;

      return tx.pedido.create({
        data: {
          referencia,
          nombreInvitado,
          telefonoInvitado,
          emailInvitado,
          metodoPago,
          subtotal,
          total: subtotal,
          estado: "PENDIENTE",
          registradoPorId: session?.user ? Number((session.user as any).id) : null,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}