-- CreateEnum
CREATE TYPE "Classificacao" AS ENUM ('SEGURO', 'CAUTELA', 'CONTRAINDICADO', 'NAO_IDENTIFICADO');

-- CreateEnum
CREATE TYPE "OrigemProduto" AS ENUM ('IA', 'MANUAL');

-- CreateEnum
CREATE TYPE "NivelRisco" AS ENUM ('ALTO', 'MODERADO', 'BAIXO');

-- CreateEnum
CREATE TYPE "CategoriaSubstancia" AS ENUM ('MEDICAMENTO', 'ALIMENTO', 'CORANTE', 'OUTRO');

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "nome_apelido" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "nome_produto" TEXT NOT NULL,
    "imagem_url" TEXT,
    "ingredientes_extraidos" JSONB NOT NULL DEFAULT '[]',
    "classificacao" "Classificacao" NOT NULL DEFAULT 'NAO_IDENTIFICADO',
    "confianca_deteccao" DOUBLE PRECISION,
    "origem" "OrigemProduto" NOT NULL DEFAULT 'IA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "g6pd_substances" (
    "id" TEXT NOT NULL,
    "nome_substancia" TEXT NOT NULL,
    "sinonimos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nivel_risco" "NivelRisco" NOT NULL,
    "categoria" "CategoriaSubstancia" NOT NULL,
    "observacoes" TEXT,
    "fonte_referencia" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "g6pd_substances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_matches" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "substance_id" TEXT NOT NULL,
    "trecho_detectado" TEXT NOT NULL,

    CONSTRAINT "scan_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_id_key" ON "devices"("device_id");

-- CreateIndex
CREATE INDEX "products_device_id_idx" ON "products"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "g6pd_substances_nome_substancia_key" ON "g6pd_substances"("nome_substancia");

-- CreateIndex
CREATE INDEX "scan_matches_product_id_idx" ON "scan_matches"("product_id");

-- CreateIndex
CREATE INDEX "scan_matches_substance_id_idx" ON "scan_matches"("substance_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_matches" ADD CONSTRAINT "scan_matches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_matches" ADD CONSTRAINT "scan_matches_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "g6pd_substances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

