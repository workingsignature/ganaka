-- AlterTable
ALTER TABLE "public"."InstrumentBroadIndustry" ADD COLUMN     "instrumentSectorId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."InstrumentBroadIndustry" ADD CONSTRAINT "InstrumentBroadIndustry_instrumentSectorId_fkey" FOREIGN KEY ("instrumentSectorId") REFERENCES "public"."InstrumentSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;
