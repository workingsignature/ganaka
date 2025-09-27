-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('BUY', 'SELL', 'BUY_STOP', 'SELL_STOP', 'BUY_LIMIT', 'SELL_LIMIT');

-- CreateEnum
CREATE TYPE "public"."OrderCreatedBy" AS ENUM ('BOT_OPPORTUNITY', 'BOT_STOP_LOSS', 'BOT_TAKE_PROFIT', 'USER_OVERRIDE');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'FILLED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ScheduleCreatedBy" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."Market" AS ENUM ('NSE', 'BSE');

-- CreateTable
CREATE TABLE "public"."PredictionHistory" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "botScheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "type" "public"."OrderType" NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "createdBy" "public"."OrderCreatedBy" NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" TEXT NOT NULL,
    "tradeBegin" TIMESTAMP(3) NOT NULL,
    "tradeEnd" TIMESTAMP(3) NOT NULL,
    "creator" "public"."ScheduleCreatedBy" NOT NULL,
    "cron" TEXT,
    "shortlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BotSchedule" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shortlist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "market" "public"."Market" NOT NULL DEFAULT 'NSE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CompanyToShortlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyToShortlist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_shortlistId_key" ON "public"."Schedule"("shortlistId");

-- CreateIndex
CREATE INDEX "_CompanyToShortlist_B_index" ON "public"."_CompanyToShortlist"("B");

-- AddForeignKey
ALTER TABLE "public"."PredictionHistory" ADD CONSTRAINT "PredictionHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PredictionHistory" ADD CONSTRAINT "PredictionHistory_botScheduleId_fkey" FOREIGN KEY ("botScheduleId") REFERENCES "public"."BotSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_shortlistId_fkey" FOREIGN KEY ("shortlistId") REFERENCES "public"."Shortlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BotSchedule" ADD CONSTRAINT "BotSchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BotSchedule" ADD CONSTRAINT "BotSchedule_botId_fkey" FOREIGN KEY ("botId") REFERENCES "public"."Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CompanyToShortlist" ADD CONSTRAINT "_CompanyToShortlist_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CompanyToShortlist" ADD CONSTRAINT "_CompanyToShortlist_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Shortlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
