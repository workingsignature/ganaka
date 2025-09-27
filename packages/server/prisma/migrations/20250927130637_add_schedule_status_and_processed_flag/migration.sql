/*
  Warnings:

  - Added the required column `processedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Schedule" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "public"."ScheduleStatus" NOT NULL;
