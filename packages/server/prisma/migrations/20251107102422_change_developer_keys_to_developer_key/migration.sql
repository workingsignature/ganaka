/*
  Warnings:

  - You are about to drop the `DeveloperKeys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DeveloperKeys" DROP CONSTRAINT "DeveloperKeys_userId_fkey";

-- DropTable
DROP TABLE "public"."DeveloperKeys";

-- CreateTable
CREATE TABLE "public"."DeveloperKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "public"."DeveloperKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperKey_key_key" ON "public"."DeveloperKey"("key");

-- CreateIndex
CREATE INDEX "DeveloperKey_userId_idx" ON "public"."DeveloperKey"("userId");

-- AddForeignKey
ALTER TABLE "public"."DeveloperKey" ADD CONSTRAINT "DeveloperKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
