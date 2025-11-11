/*
  Warnings:

  - You are about to drop the column `broad_industry` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `broad_sector` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `exchange_token` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `groww_symbol` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `internal_trading_symbol` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `trading_symbol` on the `Instrument` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[growwSymbol]` on the table `Instrument` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `broadIndustryId` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `broadSectorId` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeToken` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `growwSymbol` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industryId` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internalTradingSymbol` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectorId` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradingSymbol` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Instrument_groww_symbol_key";

-- DropIndex
DROP INDEX "public"."Instrument_trading_symbol_groww_symbol_name_idx";

-- AlterTable
ALTER TABLE "public"."Instrument" DROP COLUMN "broad_industry",
DROP COLUMN "broad_sector",
DROP COLUMN "exchange_token",
DROP COLUMN "groww_symbol",
DROP COLUMN "industry",
DROP COLUMN "internal_trading_symbol",
DROP COLUMN "sector",
DROP COLUMN "trading_symbol",
ADD COLUMN     "broadIndustryId" TEXT NOT NULL,
ADD COLUMN     "broadSectorId" TEXT NOT NULL,
ADD COLUMN     "exchangeToken" TEXT NOT NULL,
ADD COLUMN     "growwSymbol" TEXT NOT NULL,
ADD COLUMN     "industryId" TEXT NOT NULL,
ADD COLUMN     "internalTradingSymbol" TEXT NOT NULL,
ADD COLUMN     "sectorId" TEXT NOT NULL,
ADD COLUMN     "tradingSymbol" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."InstrumentBroadSector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentBroadSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstrumentSector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "broadSectorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstrumentBroadIndustry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentBroadIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstrumentIndustry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "broadIndustryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstrumentBroadSector_name_idx" ON "public"."InstrumentBroadSector"("name");

-- CreateIndex
CREATE INDEX "InstrumentSector_name_broadSectorId_idx" ON "public"."InstrumentSector"("name", "broadSectorId");

-- CreateIndex
CREATE INDEX "InstrumentBroadIndustry_name_idx" ON "public"."InstrumentBroadIndustry"("name");

-- CreateIndex
CREATE INDEX "InstrumentIndustry_name_broadIndustryId_idx" ON "public"."InstrumentIndustry"("name", "broadIndustryId");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_growwSymbol_key" ON "public"."Instrument"("growwSymbol");

-- CreateIndex
CREATE INDEX "Instrument_tradingSymbol_growwSymbol_name_broadSectorId_sec_idx" ON "public"."Instrument"("tradingSymbol", "growwSymbol", "name", "broadSectorId", "sectorId", "broadIndustryId", "industryId");

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_broadSectorId_fkey" FOREIGN KEY ("broadSectorId") REFERENCES "public"."InstrumentBroadSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."InstrumentSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_broadIndustryId_fkey" FOREIGN KEY ("broadIndustryId") REFERENCES "public"."InstrumentBroadIndustry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."InstrumentIndustry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstrumentSector" ADD CONSTRAINT "InstrumentSector_broadSectorId_fkey" FOREIGN KEY ("broadSectorId") REFERENCES "public"."InstrumentBroadSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstrumentIndustry" ADD CONSTRAINT "InstrumentIndustry_broadIndustryId_fkey" FOREIGN KEY ("broadIndustryId") REFERENCES "public"."InstrumentBroadIndustry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
