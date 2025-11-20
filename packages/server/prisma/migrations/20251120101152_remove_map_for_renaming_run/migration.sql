/*
  Warnings:

  - You are about to drop the `StrategyVersionRun` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RunExecution" DROP CONSTRAINT "RunExecution_runId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StrategyVersionRun" DROP CONSTRAINT "StrategyVersionRun_versionId_fkey";

-- DropTable
DROP TABLE "public"."StrategyVersionRun";

-- CreateTable
CREATE TABLE "public"."Run" (
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

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Run_versionId_idx" ON "public"."Run"("versionId");

-- AddForeignKey
ALTER TABLE "public"."Run" ADD CONSTRAINT "Run_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RunExecution" ADD CONSTRAINT "RunExecution_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
