/*
  Warnings:

  - You are about to alter the column `current_price` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `dividend_yield` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `price_to_earnings` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(8,2)`.
  - You are about to alter the column `price_to_book` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(8,2)`.
  - You are about to alter the column `roe` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `net_margin` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `debt_to_equity` on the `assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(8,2)`.
  - You are about to alter the column `quantity` on the `wallet_assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,8)`.
  - You are about to alter the column `average_price` on the `wallet_assets` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'FII', 'ETF', 'BDR', 'CRYPTO');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('ABOVE', 'BELOW', 'EQUAL');

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "current_price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "dividend_yield" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "price_to_earnings" SET DATA TYPE DECIMAL(8,2),
ALTER COLUMN "price_to_book" SET DATA TYPE DECIMAL(8,2),
ALTER COLUMN "roe" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "net_margin" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "debt_to_equity" SET DATA TYPE DECIMAL(8,2);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "wallet_assets" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "average_price" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "target_price" DECIMAL(10,2) NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_alerts_user_id_idx" ON "price_alerts"("user_id");

-- CreateIndex
CREATE INDEX "price_alerts_asset_id_idx" ON "price_alerts"("asset_id");

-- CreateIndex
CREATE INDEX "price_alerts_is_active_idx" ON "price_alerts"("is_active");

-- CreateIndex
CREATE INDEX "assets_sector_idx" ON "assets"("sector");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- CreateIndex
CREATE INDEX "philosophies_user_id_idx" ON "philosophies"("user_id");

-- CreateIndex
CREATE INDEX "strategy_profiles_user_id_idx" ON "strategy_profiles"("user_id");

-- CreateIndex
CREATE INDEX "strategy_profiles_is_active_idx" ON "strategy_profiles"("is_active");

-- CreateIndex
CREATE INDEX "wallet_assets_wallet_id_idx" ON "wallet_assets"("wallet_id");

-- CreateIndex
CREATE INDEX "wallet_assets_asset_id_idx" ON "wallet_assets"("asset_id");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
