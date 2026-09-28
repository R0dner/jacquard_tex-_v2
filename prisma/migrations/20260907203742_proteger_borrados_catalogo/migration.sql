-- DropForeignKey
ALTER TABLE "grupos_productos" DROP CONSTRAINT "grupos_productos_categoria_id_fkey";

-- DropForeignKey
ALTER TABLE "producto_variantes" DROP CONSTRAINT "producto_variantes_color_id_fkey";

-- DropForeignKey
ALTER TABLE "producto_variantes" DROP CONSTRAINT "producto_variantes_talla_id_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_grupo_producto_id_fkey";

-- AddForeignKey
ALTER TABLE "grupos_productos" ADD CONSTRAINT "grupos_productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_grupo_producto_id_fkey" FOREIGN KEY ("grupo_producto_id") REFERENCES "grupos_productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_variantes" ADD CONSTRAINT "producto_variantes_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_variantes" ADD CONSTRAINT "producto_variantes_talla_id_fkey" FOREIGN KEY ("talla_id") REFERENCES "tallas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
