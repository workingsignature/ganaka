/*
  Warnings:

  - You are about to drop the column `processed` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "processed",
DROP COLUMN "processedAt";
