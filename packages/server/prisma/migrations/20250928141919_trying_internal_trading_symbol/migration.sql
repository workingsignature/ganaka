/*
  Warnings:

  - A unique constraint covering the columns `[internal_trading_symbol]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Instrument_groww_symbol_key";

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_internal_trading_symbol_key" ON "public"."Instrument"("internal_trading_symbol");
