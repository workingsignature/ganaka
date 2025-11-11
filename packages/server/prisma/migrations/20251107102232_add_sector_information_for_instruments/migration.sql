/*
  Warnings:

  - Added the required column `broad_industry` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `broad_sector` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `Instrument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Instrument" ADD COLUMN     "broad_industry" TEXT NOT NULL,
ADD COLUMN     "broad_sector" TEXT NOT NULL,
ADD COLUMN     "industry" TEXT NOT NULL,
ADD COLUMN     "sector" TEXT NOT NULL;
