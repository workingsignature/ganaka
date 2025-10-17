-- CreateEnum
CREATE TYPE "public"."DeveloperKeyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "public"."DeveloperKeys" ADD COLUMN     "status" "public"."DeveloperKeyStatus" NOT NULL DEFAULT 'ACTIVE';
