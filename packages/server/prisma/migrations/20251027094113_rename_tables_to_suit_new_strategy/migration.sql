/*
  Warnings:

  - You are about to drop the `StrategyVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StrategyVersionRuns` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."RunType" AS ENUM ('BACKTEST', 'LIVE');

-- CreateEnum
CREATE TYPE "public"."RunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."StrategyVersion" DROP CONSTRAINT "StrategyVersion_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StrategyVersionRuns" DROP CONSTRAINT "StrategyVersionRuns_strategyVersionId_fkey";

-- AlterTable
ALTER TABLE "public"."Strategy" ADD COLUMN     "customAttributes" JSONB DEFAULT '{}',
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[];

-- DropTable
DROP TABLE "public"."StrategyVersion";

-- DropTable
DROP TABLE "public"."StrategyVersionRuns";

-- DropEnum
DROP TYPE "public"."StrategyVersionRunStatus";

-- CreateTable
CREATE TABLE "public"."Version" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "customAttributes" JSONB DEFAULT '{}',
    "strategyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Run" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "runType" "public"."RunType" NOT NULL,
    "errorLog" TEXT,
    "customAttributes" JSONB DEFAULT '{}',
    "status" "public"."RunStatus" NOT NULL DEFAULT 'PENDING',
    "versionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Run_versionId_idx" ON "public"."Run"("versionId");

-- AddForeignKey
ALTER TABLE "public"."Version" ADD CONSTRAINT "Version_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "public"."Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Run" ADD CONSTRAINT "Run_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
