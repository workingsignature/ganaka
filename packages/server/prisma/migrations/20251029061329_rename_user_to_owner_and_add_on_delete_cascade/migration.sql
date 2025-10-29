/*
  Warnings:

  - You are about to drop the column `userId` on the `Strategy` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Strategy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."DeveloperKeys" DROP CONSTRAINT "DeveloperKeys_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Run" DROP CONSTRAINT "Run_versionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shortlist" DROP CONSTRAINT "Shortlist_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Strategy" DROP CONSTRAINT "Strategy_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Version" DROP CONSTRAINT "Version_strategyId_fkey";

-- DropIndex
DROP INDEX "public"."Strategy_userId_name_idx";

-- AlterTable
ALTER TABLE "public"."Strategy" DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Strategy_ownerId_name_idx" ON "public"."Strategy"("ownerId", "name");

-- AddForeignKey
ALTER TABLE "public"."Shortlist" ADD CONSTRAINT "Shortlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Strategy" ADD CONSTRAINT "Strategy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Version" ADD CONSTRAINT "Version_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "public"."Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Run" ADD CONSTRAINT "Run_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "public"."Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeveloperKeys" ADD CONSTRAINT "DeveloperKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
