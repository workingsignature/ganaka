/*
  Warnings:

  - You are about to drop the column `broadIndustryId` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `broadSectorId` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `industryId` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `sectorId` on the `Instrument` table. All the data in the column will be lost.
  - You are about to drop the column `instrumentSectorId` on the `InstrumentBroadIndustry` table. All the data in the column will be lost.
  - You are about to drop the column `broadIndustryId` on the `InstrumentIndustry` table. All the data in the column will be lost.
  - You are about to drop the column `broadSectorId` on the `InstrumentSector` table. All the data in the column will be lost.
  - Added the required column `broadIndustryName` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `broadSectorName` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industryName` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectorName` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `broadIndustryName` to the `InstrumentIndustry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `broadSectorName` to the `InstrumentSector` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_broadIndustryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_broadSectorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_industryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_sectorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InstrumentBroadIndustry" DROP CONSTRAINT "InstrumentBroadIndustry_instrumentSectorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InstrumentIndustry" DROP CONSTRAINT "InstrumentIndustry_broadIndustryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InstrumentSector" DROP CONSTRAINT "InstrumentSector_broadSectorId_fkey";

-- DropIndex
DROP INDEX "public"."Instrument_tradingSymbol_growwSymbol_name_broadSectorId_sec_idx";

-- DropIndex
DROP INDEX "public"."InstrumentIndustry_name_broadIndustryId_idx";

-- DropIndex
DROP INDEX "public"."InstrumentSector_name_broadSectorId_idx";

-- AlterTable
ALTER TABLE "public"."Instrument" DROP COLUMN "broadIndustryId",
DROP COLUMN "broadSectorId",
DROP COLUMN "industryId",
DROP COLUMN "sectorId",
ADD COLUMN     "broadIndustryName" TEXT NOT NULL,
ADD COLUMN     "broadSectorName" TEXT NOT NULL,
ADD COLUMN     "industryName" TEXT NOT NULL,
ADD COLUMN     "sectorName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."InstrumentBroadIndustry" DROP COLUMN "instrumentSectorId",
ADD COLUMN     "sectorName" TEXT;

-- AlterTable
ALTER TABLE "public"."InstrumentIndustry" DROP COLUMN "broadIndustryId",
ADD COLUMN     "broadIndustryName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."InstrumentSector" DROP COLUMN "broadSectorId",
ADD COLUMN     "broadSectorName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Instrument_tradingSymbol_growwSymbol_name_broadSectorName_s_idx" ON "public"."Instrument"("tradingSymbol", "growwSymbol", "name", "broadSectorName", "sectorName", "broadIndustryName", "industryName");

-- CreateIndex
CREATE INDEX "InstrumentIndustry_name_broadIndustryName_idx" ON "public"."InstrumentIndustry"("name", "broadIndustryName");

-- CreateIndex
CREATE INDEX "InstrumentSector_name_broadSectorName_idx" ON "public"."InstrumentSector"("name", "broadSectorName");

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_broadSectorName_fkey" FOREIGN KEY ("broadSectorName") REFERENCES "public"."InstrumentBroadSector"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_sectorName_fkey" FOREIGN KEY ("sectorName") REFERENCES "public"."InstrumentSector"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_broadIndustryName_fkey" FOREIGN KEY ("broadIndustryName") REFERENCES "public"."InstrumentBroadIndustry"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_industryName_fkey" FOREIGN KEY ("industryName") REFERENCES "public"."InstrumentIndustry"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstrumentSector" ADD CONSTRAINT "InstrumentSector_broadSectorName_fkey" FOREIGN KEY ("broadSectorName") REFERENCES "public"."InstrumentBroadSector"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstrumentBroadIndustry" ADD CONSTRAINT "InstrumentBroadIndustry_sectorName_fkey" FOREIGN KEY ("sectorName") REFERENCES "public"."InstrumentSector"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstrumentIndustry" ADD CONSTRAINT "InstrumentIndustry_broadIndustryName_fkey" FOREIGN KEY ("broadIndustryName") REFERENCES "public"."InstrumentBroadIndustry"("name") ON DELETE CASCADE ON UPDATE CASCADE;
