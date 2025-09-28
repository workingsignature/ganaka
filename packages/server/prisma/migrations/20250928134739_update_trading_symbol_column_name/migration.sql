/*
  Warnings:

  - You are about to drop the column `tradingsymbol` on the `Instrument` table. All the data in the column will be lost.
  - Added the required column `trading_symbol` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Instrument" DROP COLUMN "tradingsymbol",
ADD COLUMN     "trading_symbol" TEXT NOT NULL;
