-- DropForeignKey
ALTER TABLE "strategy_profiles" DROP CONSTRAINT "strategy_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_assets" DROP CONSTRAINT "wallet_assets_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_assets" DROP CONSTRAINT "wallet_assets_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_user_id_fkey";

-- AddForeignKey
ALTER TABLE "strategy_profiles" ADD CONSTRAINT "strategy_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_assets" ADD CONSTRAINT "wallet_assets_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_assets" ADD CONSTRAINT "wallet_assets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
