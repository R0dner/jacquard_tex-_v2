import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { descontarStock, expirarReservasVencidas, fechaExpiracionReserva } from "@/lib/reservas";

export async function POST(req: Request) {
  const session = await auth();
  const {
    items, metodoPago, direccionEnvio, nombreInvitado, telefonoInvitado, emailInvitado,
    conEnvio, departamentoEnvio, guardarDireccion,
  } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (!session?.user && (!nombreInvitado || !telefonoInvitado)) {
    return NextResponse.json({ error: "Faltan tus datos de contacto" }, { status: 400 });
  }
  if (conEnvio && (!direccionEnvio || !departamentoEnvio)) {
    return NextResponse.json({ error: "Para el envío indica el departamento y la dirección" }, { status: 400 });
  }

  // Libera primero las reservas vencidas: su stock vuelve a estar disponible para esta compra.
  await expirarReservasVencidas();

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      // El costo de envío se calcula SIEMPRE en el servidor, nunca se confía en lo que manda el navegador.
      let costoEnvio = 0;
      if (conEnvio) {
        const tarifa = await tx.tarifaEnvio.findUnique({ where: { departamento: departamentoEnvio } });
        if (!tarifa || !tarifa.activo) {
          throw new Error(`Por ahora no hacemos envíos a ${departamentoEnvio}`);
        }
        costoEnvio = Number(tarifa.costo);
      }

      let subtotal = 0;
      const itemsData = [];

      for (const item of items) {
        const variante = await tx.productoVariante.findUnique({
          where: { sku: item.sku },
          include: { producto: true, color: true, talla: true },
        });
        if (!variante) throw new Error(`Producto no encontrado: ${item.sku}`);

        // Mismo precio que ve el cliente en la tienda: el de oferta si la variante está en oferta.
        const precioUnitario = Number(
          variante.enOferta && variante.precioOferta ? variante.precioOferta : variante.precioVenta
        );
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
      const clienteId = session?.user ? Number((session.user as any).id) : null;

      const creado = await tx.pedido.create({
        data: {
          referencia,
          clienteId,
          nombreInvitado: session?.user ? session.user.name : nombreInvitado,
          telefonoInvitado,
          emailInvitado: session?.user ? session.user.email : emailInvitado,
          direccionEnvio: conEnvio ? direccionEnvio : null,
          departamentoEnvio: conEnvio ? departamentoEnvio : null,
          metodoPago,
          subtotal,
          costoEnvio,
          total: subtotal + costoEnvio,
          estado: "RESERVADO",
          reservaExpiraEn: fechaExpiracionReserva(),
          items: { create: itemsData },
        },
        include: { items: true },
      });

      // Aparta el stock ya mismo (24 h): evita que un vendedor y un cliente vendan la misma prenda.
      await descontarStock(tx, creado.id, `Reserva - Pedido ${referencia}`, null);

      if (clienteId && conEnvio && guardarDireccion) {
        const yaExiste = await tx.direccionCliente.findFirst({
          where: { clienteId, direccion: direccionEnvio, departamento: departamentoEnvio },
        });
        if (!yaExiste) {
          const tiene = await tx.direccionCliente.count({ where: { clienteId } });
          await tx.direccionCliente.create({
            data: { clienteId, direccion: direccionEnvio, departamento: departamentoEnvio, predeterminada: tiene === 0 },
          });
        }
      }

      return creado;
    }, { timeout: 20000, maxWait: 10000 });

    return NextResponse.json(pedido, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
