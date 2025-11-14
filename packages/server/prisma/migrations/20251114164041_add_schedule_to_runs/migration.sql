-- Migrate existing startTime and endTime to schedule JSON
-- First, add the schedule column as nullable temporarily
ALTER TABLE "public"."StrategyVersionRun" 
  ADD COLUMN "schedule" JSONB;

-- Migrate existing data: convert startTime/endTime to ONCE schedule
-- Convert timestamps to ISO 8601 format strings (YYYY-MM-DDTHH:MM:SS.sssZ)
UPDATE "public"."StrategyVersionRun"
SET "schedule" = jsonb_build_object(
  'scheduleType', 'ONCE',
  'startTime', to_jsonb(to_char("startTime" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')),
  'endTime', CASE 
    WHEN "endTime" IS NOT NULL 
    THEN to_jsonb(to_char("endTime" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'))
    ELSE jsonb 'null'
  END
)
WHERE "schedule" IS NULL;

-- Make schedule NOT NULL now that all rows have data
ALTER TABLE "public"."StrategyVersionRun" 
  ALTER COLUMN "schedule" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "public"."StrategyVersionRun" 
  DROP COLUMN "startTime",
  DROP COLUMN "endTime";

