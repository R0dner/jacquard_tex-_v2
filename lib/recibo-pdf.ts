import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PedidoRecibo = {
  referencia: string;
  fechaPedido: string;
  nombreInvitado: string | null;
  telefonoInvitado: string | null;
  cliente?: { nombre: string | null; email: string } | null;
  metodoPago: string | null;
  direccionEnvio: string | null;
  departamentoEnvio: string | null;
  subtotal: string | number;
  costoEnvio: string | number;
  total: string | number;
  items: {
    nombreSnapshot: string;
    colorSnapshot: string | null;
    tallaSnapshot: string | null;
    cantidad: number;
    precioUnitario: string | number;
    subtotal: string | number;
  }[];
};

const METODO_LABEL: Record<string, string> = {
  efectivo: "Contra entrega",
  qr: "QR / Transferencia",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

const bs = (n: string | number) => `Bs ${Number(n).toFixed(2)}`;

/**
 * Genera y descarga el recibo de un pedido: una línea por prenda con cantidad,
 * color, talla y subtotal; el envío (si lo hubo) y el total final. Pensado para
 * imprimirse y entregarse al cliente.
 */
export function descargarRecibo(p: PedidoRecibo) {
  const doc = new jsPDF();
  const ancho = doc.internal.pageSize.getWidth();
  const margen = 14;
  const derecha = ancho - margen;

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(28, 35, 51);
  doc.text("Jacquard Tex", margen, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text("Recibo de pedido", derecha, 20, { align: "right" });
  doc.setDrawColor(201, 169, 97);
  doc.setLineWidth(0.8);
  doc.line(margen, 25, derecha, 25);

  // Datos del pedido
  const nombre = p.nombreInvitado ?? p.cliente?.nombre ?? p.cliente?.email ?? "—";
  const fecha = new Date(p.fechaPedido).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
  const conEnvio = Number(p.costoEnvio) > 0 || !!p.departamentoEnvio;
  const entrega = conEnvio
    ? `Envío a ${p.departamentoEnvio ?? ""}${p.direccionEnvio ? ` — ${p.direccionEnvio}` : ""}`.trim()
    : "Recojo en tienda";

  doc.setFontSize(10);
  const filas: [string, string][] = [
    ["Pedido", p.referencia],
    ["Fecha", fecha],
    ["Cliente", nombre],
    ["Teléfono", p.telefonoInvitado ?? "—"],
    ["Entrega", entrega],
    ["Pago", p.metodoPago ? (METODO_LABEL[p.metodoPago] ?? p.metodoPago) : "—"],
  ];
  let y = 34;
  for (const [etiqueta, valor] of filas) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    doc.text(`${etiqueta}:`, margen, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const lineas = doc.splitTextToSize(valor, derecha - margen - 24);
    doc.text(lineas, margen + 24, y);
    y += 6 * lineas.length;
  }

  // Detalle de prendas
  autoTable(doc, {
    startY: y + 4,
    head: [["Cant.", "Detalle", "P. unitario", "Subtotal"]],
    body: p.items.map((it) => [
      String(it.cantidad),
      [it.nombreSnapshot, it.colorSnapshot, it.tallaSnapshot ? `Talla ${it.tallaSnapshot}` : null]
        .filter(Boolean)
        .join(" — "),
      bs(it.precioUnitario),
      bs(it.subtotal),
    ]),
    headStyles: { fillColor: [28, 35, 51], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      2: { halign: "right", cellWidth: 32 },
      3: { halign: "right", cellWidth: 32 },
    },
  });

  // Totales
  let yt = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text("Subtotal prendas", derecha - 40, yt, { align: "right" });
  doc.text(bs(p.subtotal), derecha, yt, { align: "right" });
  if (conEnvio) {
    yt += 6;
    doc.text(`Envío${p.departamentoEnvio ? ` (${p.departamentoEnvio})` : ""}`, derecha - 40, yt, { align: "right" });
    doc.text(bs(p.costoEnvio), derecha, yt, { align: "right" });
  }
  yt += 4;
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(derecha - 80, yt, derecha, yt);
  yt += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text("TOTAL", derecha - 40, yt, { align: "right" });
  doc.text(bs(p.total), derecha, yt, { align: "right" });

  // Pie
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text("Gracias por tu compra.", ancho / 2, 280, { align: "center" });

  doc.save(`recibo-${p.referencia}.pdf`);
}
