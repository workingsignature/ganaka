-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "email" DROP NOT NULL;
