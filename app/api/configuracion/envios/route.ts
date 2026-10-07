import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/auth-admin";
import { NextResponse } from "next/server";

// GET: el checkout recibe solo los departamentos activos; el Administrador Principal
// recibe todos (también los desactivados) para poder editarlos.
export async function GET() {
  const session = await adminAuth();
  const esAdmin = (session?.user as any)?.role === "ADMIN_PRINCIPAL";
  const tarifas = await prisma.tarifaEnvio.findMany({
    where: esAdmin ? {} : { activo: true },
    orderBy: { departamento: "asc" },
  });
  return NextResponse.json(
    tarifas.map((t) => ({ id: t.id, departamento: t.departamento, costo: Number(t.costo), activo: t.activo }))
  );
}

export async function PATCH(req: Request) {
  const session = await adminAuth();
  if ((session?.user as any)?.role !== "ADMIN_PRINCIPAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { tarifas } = (await req.json()) as { tarifas: { id: number; costo: number; activo: boolean }[] };
  if (!Array.isArray(tarifas)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  for (const t of tarifas) {
    if (typeof t.costo !== "number" || !isFinite(t.costo) || t.costo < 0) {
      return NextResponse.json({ error: "El costo de envío debe ser un número mayor o igual a 0" }, { status: 400 });
    }
  }

  await prisma.$transaction(
    tarifas.map((t) =>
      prisma.tarifaEnvio.update({ where: { id: t.id }, data: { costo: t.costo, activo: !!t.activo } })
    )
  );
  return NextResponse.json({ ok: true });
}
