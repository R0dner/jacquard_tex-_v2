-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN "comprobante_url" TEXT;

-- CreateTable
CREATE TABLE "configuracion_pago" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "qr_imagen_url" TEXT,
    "banco" VARCHAR(255),
    "numero_cuenta" VARCHAR(100),
    "titular" VARCHAR(255),
    "instrucciones" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pago_pkey" PRIMARY KEY ("id")
);
