-- DropForeignKey
ALTER TABLE "movimientos_inventario" DROP CONSTRAINT "movimientos_inventario_aprobado_por_id_fkey";

-- DropForeignKey
ALTER TABLE "movimientos_inventario" DROP CONSTRAINT "movimientos_inventario_registrado_por_id_fkey";

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_aprobado_por_id_fkey" FOREIGN KEY ("aprobado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
