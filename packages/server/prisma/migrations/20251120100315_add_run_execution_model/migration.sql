/*
  Warnings:

  - You are about to drop the `Run` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- DropForeignKey
ALTER TABLE "public"."Run" DROP CONSTRAINT "Run_versionId_fkey";

-- DropTable
DROP TABLE "public"."Run";

-- CreateTable
CREATE TABLE "public"."StrategyVersionRun" (
    "id" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
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

    CONSTRAINT "StrategyVersionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RunExecution" (
    "id" TEXT NOT NULL,
    "executionTime" TIMESTAMP(3) NOT NULL,
    "status" "public"."ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "executedAt" TIMESTAMP(3),
    "errorLog" TEXT,
    "timeslot" JSONB,
    "day" TEXT,
    "runId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrategyVersionRun_versionId_idx" ON "public"."StrategyVersionRun"("versionId");

-- CreateIndex
CREATE INDEX "RunExecution_runId_idx" ON "public"."RunExecution"("runId");

-- CreateIndex
CREATE INDEX "RunExecution_executionTime_idx" ON "public"."RunExecution"("executionTime");

-- AddForeignKey
ALTER TABLE "public"."StrategyVersionRun" ADD CONSTRAINT "StrategyVersionRun_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RunExecution" ADD CONSTRAINT "RunExecution_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."StrategyVersionRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
