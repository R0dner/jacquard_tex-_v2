/*
  Warnings:

  - The values [ADMIN_SECUNDARIO,VENDEDOR,DISTRIBUIDOR] on the enum `RolUsuario` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RolUsuario_new" AS ENUM ('ADMIN_PRINCIPAL', 'ADMIN_INVENTARIO', 'VENDEDOR_PREVENTA', 'VENDEDOR_DESPACHO');
ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "RolUsuario_new" USING ("rol"::text::"RolUsuario_new");
ALTER TYPE "RolUsuario" RENAME TO "RolUsuario_old";
ALTER TYPE "RolUsuario_new" RENAME TO "RolUsuario";
DROP TYPE "public"."RolUsuario_old";
COMMIT;
