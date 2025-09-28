/*
  Warnings:

  - A unique constraint covering the columns `[groww_symbol]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Instrument_trading_symbol_key";

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_groww_symbol_key" ON "public"."Instrument"("groww_symbol");
