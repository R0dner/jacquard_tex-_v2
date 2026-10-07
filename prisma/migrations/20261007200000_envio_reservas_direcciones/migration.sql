-- AlterEnum
ALTER TYPE "EstadoPedido" ADD VALUE 'RESERVADO';

-- AlterTable
ALTER TABLE "pedidos"
  ADD COLUMN "departamento_envio" VARCHAR(100),
  ADD COLUMN "reserva_expira_en" TIMESTAMP(3),
  ADD COLUMN "stock_descontado" BOOLEAN NOT NULL DEFAULT false;

-- Los pedidos que ya salieron (enviado/entregado) descontaron stock con la lógica anterior.
UPDATE "pedidos" SET "stock_descontado" = true WHERE "estado" IN ('ENVIADO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "tarifas_envio" (
    "id" SERIAL NOT NULL,
    "departamento" VARCHAR(100) NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones_cliente" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "departamento" VARCHAR(100),
    "predeterminada" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direcciones_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tarifas_envio_departamento_key" ON "tarifas_envio"("departamento");

-- CreateIndex
CREATE INDEX "direcciones_cliente_cliente_id_idx" ON "direcciones_cliente"("cliente_id");

-- AddForeignKey
ALTER TABLE "direcciones_cliente" ADD CONSTRAINT "direcciones_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Datos iniciales: los dos departamentos con envío (costo editable desde el panel)
INSERT INTO "tarifas_envio" ("departamento", "costo", "activo", "updated_at") VALUES
  ('Cochabamba', 20, true, CURRENT_TIMESTAMP),
  ('Santa Cruz', 30, true, CURRENT_TIMESTAMP);
