/*
  Warnings:

  - Added the required column `name` to the `Shortlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Shortlist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ShortlistType" AS ENUM ('CURATED', 'USER');

-- DropForeignKey
ALTER TABLE "public"."Shortlist" DROP CONSTRAINT "Shortlist_createdById_fkey";

-- DropIndex
DROP INDEX "public"."Shortlist_createdById_idx";

-- AlterTable
ALTER TABLE "public"."Shortlist" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "public"."ShortlistType" NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Shortlist_createdById_name_type_idx" ON "public"."Shortlist"("createdById", "name", "type");

-- AddForeignKey
ALTER TABLE "public"."Shortlist" ADD CONSTRAINT "Shortlist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
