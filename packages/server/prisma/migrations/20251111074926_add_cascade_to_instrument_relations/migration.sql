-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_broadIndustryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_broadSectorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_industryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Instrument" DROP CONSTRAINT "Instrument_sectorId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_broadSectorId_fkey" FOREIGN KEY ("broadSectorId") REFERENCES "public"."InstrumentBroadSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."InstrumentSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_broadIndustryId_fkey" FOREIGN KEY ("broadIndustryId") REFERENCES "public"."InstrumentBroadIndustry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instrument" ADD CONSTRAINT "Instrument_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."InstrumentIndustry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
