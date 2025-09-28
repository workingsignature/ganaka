/*
  Warnings:

  - The primary key for the `Instrument` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Instrument` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trading_symbol]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_trading_symbol_key" ON "public"."Instrument"("trading_symbol");
