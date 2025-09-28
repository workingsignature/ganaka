-- CreateIndex
CREATE INDEX "Instrument_trading_symbol_groww_symbol_name_idx" ON "public"."Instrument"("trading_symbol", "groww_symbol", "name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "UserSecurity_userId_idx" ON "public"."UserSecurity"("userId");
