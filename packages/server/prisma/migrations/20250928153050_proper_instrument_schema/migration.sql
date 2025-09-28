/*
  Warnings:

  - The required column `id` was added to the `Instrument` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Instrument_groww_symbol_key";

-- AlterTable
ALTER TABLE "public"."Instrument" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id");
