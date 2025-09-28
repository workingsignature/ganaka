-- CreateTable
CREATE TABLE "public"."Instrument" (
    "id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "exchange_token" DECIMAL(65,30) NOT NULL,
    "tradingsymbol" TEXT NOT NULL,
    "groww_symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instrument_type" TEXT NOT NULL,
    "internal_trading_symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);
