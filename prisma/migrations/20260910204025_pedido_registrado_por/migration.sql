-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "registrado_por_id" INTEGER;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
