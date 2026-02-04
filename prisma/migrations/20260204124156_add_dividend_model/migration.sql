-- CreateTable
CREATE TABLE "dividends" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "ex_date" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dividends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dividends_asset_id_idx" ON "dividends"("asset_id");

-- CreateIndex
CREATE INDEX "dividends_payment_date_idx" ON "dividends"("payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "dividends_asset_id_payment_date_type_key" ON "dividends"("asset_id", "payment_date", "type");

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
