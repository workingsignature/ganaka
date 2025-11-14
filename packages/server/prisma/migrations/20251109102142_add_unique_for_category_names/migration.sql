/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `InstrumentBroadIndustry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `InstrumentBroadSector` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `InstrumentIndustry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `InstrumentSector` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InstrumentBroadIndustry_name_key" ON "public"."InstrumentBroadIndustry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentBroadSector_name_key" ON "public"."InstrumentBroadSector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentIndustry_name_key" ON "public"."InstrumentIndustry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentSector_name_key" ON "public"."InstrumentSector"("name");
