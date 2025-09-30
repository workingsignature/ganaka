/*
  Warnings:

  - You are about to drop the column `creator` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `cron` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `shortlistId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `tradeBegin` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `tradeEnd` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `BotSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PredictionHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endDate` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Shortlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forDate` to the `Shortlist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ScheduleType" AS ENUM ('USER', 'SYSTEM');

-- AlterEnum
ALTER TYPE "public"."ScheduleStatus" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "public"."BotSchedule" DROP CONSTRAINT "BotSchedule_botId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BotSchedule" DROP CONSTRAINT "BotSchedule_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PredictionHistory" DROP CONSTRAINT "PredictionHistory_botScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PredictionHistory" DROP CONSTRAINT "PredictionHistory_instrumentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_shortlistId_fkey";

-- DropIndex
DROP INDEX "public"."Schedule_shortlistId_key";

-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "creator",
DROP COLUMN "cron",
DROP COLUMN "shortlistId",
DROP COLUMN "tradeBegin",
DROP COLUMN "tradeEnd",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "public"."ScheduleType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Shortlist" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "forDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."BotSchedule";

-- DropTable
DROP TABLE "public"."PredictionHistory";

-- DropEnum
DROP TYPE "public"."ScheduleCreatedBy";

-- CreateIndex
CREATE INDEX "Shortlist_createdById_forDate_idx" ON "public"."Shortlist"("createdById", "forDate");

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shortlist" ADD CONSTRAINT "Shortlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
