-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "RolCliente" AS ENUM ('CLIENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoEmpresaMedia" AS ENUM ('CARRUSEL', 'GALERIA');

-- CreateEnum
CREATE TYPE "TipoPublicacion" AS ENUM ('NOVEDAD', 'PUBLICACION');

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_productos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "categoria_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "hex" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tallas" (
    "id" SERIAL NOT NULL,
    "sigla" VARCHAR(10) NOT NULL,
    "descripcion" VARCHAR(255),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tallas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "observaciones" TEXT,
    "guia_codigos" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "valoracion" DECIMAL(3,2),
    "fecha_disponible" DATE,
    "grupo_producto_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_variantes" (
    "id" SERIAL NOT NULL,
    "sku" VARCHAR(255) NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "color_id" INTEGER,
    "talla_id" INTEGER,
    "precio_costo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_venta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "en_oferta" BOOLEAN NOT NULL DEFAULT false,
    "precio_oferta" DECIMAL(10,2),
    "fecha_inicio_oferta" DATE,
    "fecha_fin_oferta" DATE,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "unidad_de_medida" VARCHAR(50),
    "estado" VARCHAR(50) NOT NULL DEFAULT 'activo',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_variantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_imagenes" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "numero_documento" VARCHAR(255),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" VARCHAR(255),
    "estado" VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "registrado_por_id" INTEGER,
    "aprobado_por_id" INTEGER,
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "total_costo" DECIMAL(10,2),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimiento_inventario_items" (
    "id" SERIAL NOT NULL,
    "movimiento_id" INTEGER NOT NULL,
    "variante_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2),
    "observaciones" TEXT,

    CONSTRAINT "movimiento_inventario_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "rol" "RolCliente" NOT NULL DEFAULT 'CLIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "referencia" VARCHAR(255) NOT NULL,
    "cliente_id" INTEGER,
    "email_invitado" VARCHAR(255),
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "metodo_pago" VARCHAR(100),
    "costo_envio" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "fecha_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_solicitada" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "variante_id" INTEGER,
    "producto_id" INTEGER,
    "nombre_snapshot" VARCHAR(255) NOT NULL,
    "talla_snapshot" VARCHAR(50),
    "color_snapshot" VARCHAR(100),
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa" (
    "id" SERIAL NOT NULL,
    "titulo_historia" VARCHAR(255),
    "descripcion_historia" TEXT,
    "filosofia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa_media" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "tipo" "TipoEmpresaMedia" NOT NULL,
    "titulo" VARCHAR(255),
    "descripcion" TEXT,
    "enlace" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresa_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoPublicacion" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "fecha" DATE NOT NULL,
    "resumen" VARCHAR(255),
    "enlace" TEXT,
    "publicado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(255) NOT NULL,
    "tipo_mensaje" VARCHAR(100),
    "descripcion" TEXT,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_productos_slug_key" ON "grupos_productos"("slug");

-- CreateIndex
CREATE INDEX "grupos_productos_categoria_id_idx" ON "grupos_productos"("categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "tallas_sigla_key" ON "tallas"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "productos_slug_key" ON "productos"("slug");

-- CreateIndex
CREATE INDEX "productos_grupo_producto_id_idx" ON "productos"("grupo_producto_id");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "producto_variantes_sku_key" ON "producto_variantes"("sku");

-- CreateIndex
CREATE INDEX "producto_variantes_stock_actual_idx" ON "producto_variantes"("stock_actual");

-- CreateIndex
CREATE UNIQUE INDEX "producto_variantes_producto_id_color_id_talla_id_key" ON "producto_variantes"("producto_id", "color_id", "talla_id");

-- CreateIndex
CREATE INDEX "producto_imagenes_producto_id_idx" ON "producto_imagenes"("producto_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_tipo_fecha_idx" ON "movimientos_inventario"("tipo", "fecha");

-- CreateIndex
CREATE INDEX "movimiento_inventario_items_movimiento_id_idx" ON "movimiento_inventario_items"("movimiento_id");

-- CreateIndex
CREATE INDEX "movimiento_inventario_items_variante_id_idx" ON "movimiento_inventario_items"("variante_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_referencia_key" ON "pedidos"("referencia");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_estado_idx" ON "pedidos"("estado");

-- CreateIndex
CREATE INDEX "pedido_items_pedido_id_idx" ON "pedido_items"("pedido_id");

-- CreateIndex
CREATE INDEX "empresa_media_empresa_id_tipo_idx" ON "empresa_media"("empresa_id", "tipo");

-- CreateIndex
CREATE INDEX "publicaciones_tipo_fecha_idx" ON "publicaciones"("tipo", "fecha");

-- AddForeignKey
ALTER TABLE "grupos_productos" ADD CONSTRAINT "grupos_productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_grupo_producto_id_fkey" FOREIGN KEY ("grupo_producto_id") REFERENCES "grupos_productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_variantes" ADD CONSTRAINT "producto_variantes_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_variantes" ADD CONSTRAINT "producto_variantes_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_variantes" ADD CONSTRAINT "producto_variantes_talla_id_fkey" FOREIGN KEY ("talla_id") REFERENCES "tallas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_imagenes" ADD CONSTRAINT "producto_imagenes_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_aprobado_por_id_fkey" FOREIGN KEY ("aprobado_por_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario_items" ADD CONSTRAINT "movimiento_inventario_items_movimiento_id_fkey" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos_inventario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario_items" ADD CONSTRAINT "movimiento_inventario_items_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "producto_variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "producto_variantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresa_media" ADD CONSTRAINT "empresa_media_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
