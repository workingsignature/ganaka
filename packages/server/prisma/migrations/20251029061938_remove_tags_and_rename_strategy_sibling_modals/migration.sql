/*
  Warnings:

  - You are about to drop the column `tags` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the `Run` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Run" DROP CONSTRAINT "Run_versionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Version" DROP CONSTRAINT "Version_strategyId_fkey";

-- AlterTable
ALTER TABLE "public"."Strategy" DROP COLUMN "tags";

-- DropTable
DROP TABLE "public"."Run";

-- DropTable
DROP TABLE "public"."Version";

-- CreateTable
CREATE TABLE "public"."StrategyVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "customAttributes" JSONB DEFAULT '{}',
    "strategyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StrategyVersionRun" (
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

    CONSTRAINT "StrategyVersionRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrategyVersionRun_versionId_idx" ON "public"."StrategyVersionRun"("versionId");

-- AddForeignKey
ALTER TABLE "public"."StrategyVersion" ADD CONSTRAINT "StrategyVersion_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "public"."Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StrategyVersionRun" ADD CONSTRAINT "StrategyVersionRun_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
