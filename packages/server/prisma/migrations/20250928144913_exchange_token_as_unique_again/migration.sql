/*
  Warnings:

  - You are about to drop the column `instrument_type` on the `Instrument` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[exchange_token]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Instrument_internal_trading_symbol_key";

-- AlterTable
ALTER TABLE "public"."Instrument" DROP COLUMN "instrument_type";

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_exchange_token_key" ON "public"."Instrument"("exchange_token");
