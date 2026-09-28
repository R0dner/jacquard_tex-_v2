-- AlterTable
ALTER TABLE "producto_imagenes" ADD COLUMN     "color_id" INTEGER;

-- CreateIndex
CREATE INDEX "producto_imagenes_color_id_idx" ON "producto_imagenes"("color_id");

-- AddForeignKey
ALTER TABLE "producto_imagenes" ADD CONSTRAINT "producto_imagenes_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
