/*
  Warnings:

  - You are about to drop the column `companyId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `PredictionHistory` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CompanyToShortlist` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[trading_symbol]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `instrumentId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instrumentId` to the `PredictionHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PredictionHistory" DROP CONSTRAINT "PredictionHistory_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CompanyToShortlist" DROP CONSTRAINT "_CompanyToShortlist_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CompanyToShortlist" DROP CONSTRAINT "_CompanyToShortlist_B_fkey";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "companyId",
ADD COLUMN     "instrumentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PredictionHistory" DROP COLUMN "companyId",
ADD COLUMN     "instrumentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Company";

-- DropTable
DROP TABLE "public"."_CompanyToShortlist";

-- DropEnum
DROP TYPE "public"."Market";

-- CreateTable
CREATE TABLE "public"."_InstrumentToShortlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstrumentToShortlist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstrumentToShortlist_B_index" ON "public"."_InstrumentToShortlist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_trading_symbol_key" ON "public"."Instrument"("trading_symbol");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "public"."Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PredictionHistory" ADD CONSTRAINT "PredictionHistory_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "public"."Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InstrumentToShortlist" ADD CONSTRAINT "_InstrumentToShortlist_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InstrumentToShortlist" ADD CONSTRAINT "_InstrumentToShortlist_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Shortlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
