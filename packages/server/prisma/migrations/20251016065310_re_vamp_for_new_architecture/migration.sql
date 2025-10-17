/*
  Warnings:

  - You are about to drop the column `forDate` on the `Shortlist` table. All the data in the column will be lost.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSecurity` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSecurity" DROP CONSTRAINT "UserSecurity_userId_fkey";

-- DropIndex
DROP INDEX "public"."Shortlist_createdById_forDate_idx";

-- AlterTable
ALTER TABLE "public"."Shortlist" DROP COLUMN "forDate";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Schedule";

-- DropTable
DROP TABLE "public"."UserSecurity";

-- DropEnum
DROP TYPE "public"."ScheduleStatus";

-- DropEnum
DROP TYPE "public"."ScheduleType";

-- CreateTable
CREATE TABLE "public"."DeveloperKeys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperKeys_key_key" ON "public"."DeveloperKeys"("key");

-- CreateIndex
CREATE INDEX "DeveloperKeys_userId_idx" ON "public"."DeveloperKeys"("userId");

-- CreateIndex
CREATE INDEX "Shortlist_createdById_idx" ON "public"."Shortlist"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."DeveloperKeys" ADD CONSTRAINT "DeveloperKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
