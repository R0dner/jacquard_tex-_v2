import { NextResponse } from "next/server";
import { expirarReservasVencidas } from "@/lib/reservas";

// Respaldo diario (ver vercel.json): las reservas también se liberan solas cada vez que
// alguien mira la tienda, el inventario o los pedidos, así que el límite de 24 h se cumple
// aunque este cron (el plan gratuito de Vercel solo permite uno al día) corra tarde.
export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const liberadas = await expirarReservasVencidas();
  return NextResponse.json({ liberadas });
}
