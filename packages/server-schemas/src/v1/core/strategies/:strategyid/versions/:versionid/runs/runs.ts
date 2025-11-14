import { z } from "zod";
import { apiResponseSchema } from "../../../../../../../common";

// ==================== Schemas ====================

/**
 * Run Type Enum
 */
export const runTypeSchema = z.enum(["BACKTEST", "LIVE"]);

/**
 * Run Status Enum
 */
export const runStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

/**
 * Schedule Schemas
 */
const timeStringSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format");

const dayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

/**
 * Time slot with duration (for specific times)
 */
const timeSlotSchema = z.object({
  time: timeStringSchema,
  durationMinutes: z.number().positive().int(),
});

/**
 * Once schedule - runs once at startTime
 */
const onceScheduleSchema = z.object({
  scheduleType: z.literal("ONCE"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable(),
});

/**
 * Daily schedule with interval
 */
const dailyScheduleSchema = z.object({
  scheduleType: z.literal("DAILY"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable().optional(),
  invocationInterval: z.number().positive().int(),
  dailyStartTime: timeStringSchema.optional(),
  dailyEndTime: timeStringSchema.optional(),
});

/**
 * Weekly schedule with interval
 */
const weeklyScheduleSchema = z.object({
  scheduleType: z.literal("WEEKLY"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable().optional(),
  daysOfWeek: z.array(dayOfWeekSchema).min(1),
  invocationInterval: z.number().positive().int(),
  dailyStartTime: timeStringSchema.optional(),
  dailyEndTime: timeStringSchema.optional(),
});

/**
 * Weekly schedule with specific times (handles multiple times per day)
 */
const weeklyTimesScheduleSchema = z.object({
  scheduleType: z.literal("WEEKLY_TIMES"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable().optional(),
  daysOfWeek: z.array(dayOfWeekSchema).min(1),
  times: z.array(timeSlotSchema).min(1),
});

/**
 * Interval schedule (every X minutes/hours)
 */
const intervalScheduleSchema = z.object({
  scheduleType: z.literal("INTERVAL"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable().optional(),
  interval: z.number().positive().int(),
  intervalUnit: z.enum(["MINUTES", "HOURS"]),
  dailyStartTime: timeStringSchema.optional(),
  dailyEndTime: timeStringSchema.optional(),
});

/**
 * Hourly schedule (every N hours)
 */
const hourlyScheduleSchema = z.object({
  scheduleType: z.literal("HOURLY"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable().optional(),
  hoursInterval: z.number().positive().int().max(23),
  dailyStartTime: timeStringSchema.optional(),
  dailyEndTime: timeStringSchema.optional(),
});

/**
 * Schedule discriminated union
 */
export const scheduleSchema = z.discriminatedUnion("scheduleType", [
  onceScheduleSchema,
  dailyScheduleSchema,
  weeklyScheduleSchema,
  weeklyTimesScheduleSchema,
  intervalScheduleSchema,
  hourlyScheduleSchema,
]);

/**
 * Run Item Schema
 */
export const runItemSchema = z.object({
  id: z.string(),
  schedule: scheduleSchema,
  currentBalance: z.number(),
  startingBalance: z.number(),
  endingBalance: z.number(),
  runType: runTypeSchema,
  errorLog: z.string().nullable(),
  customAttributes: z.unknown().optional(),
  status: runStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ==================== GET /strategies/:strategyid/versions/:versionid/runs ====================

export const getRuns = {
  params: z.object({
    strategyid: z.string(),
    versionid: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: z.array(runItemSchema),
  }),
};

// ==================== GET /strategies/:strategyid/versions/:versionid/runs/:id ====================

export const getRun = {
  params: z.object({
    strategyid: z.string(),
    versionid: z.string(),
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: runItemSchema,
  }),
};

// ==================== POST /strategies/:strategyid/versions/:versionid/runs ====================

export const createRun = {
  params: z.object({
    strategyid: z.string(),
    versionid: z.string(),
  }),
  body: z.object({
    schedule: scheduleSchema,
    currentBalance: z.number().default(0),
    startingBalance: z.number().default(0),
    endingBalance: z.number().default(0),
    runType: runTypeSchema,
    errorLog: z.string().optional(),
    customAttributes: z.record(z.string(), z.unknown()).optional().default({}),
    status: runStatusSchema.optional().default("PENDING"),
  }),
  response: apiResponseSchema.extend({
    data: runItemSchema,
  }),
};

// ==================== PUT /strategies/:strategyid/versions/:versionid/runs/:id ====================

export const updateRun = {
  params: z.object({
    strategyid: z.string(),
    versionid: z.string(),
    id: z.string(),
  }),
  body: z.object({
    schedule: scheduleSchema.optional(),
    currentBalance: z.number().optional(),
    startingBalance: z.number().optional(),
    endingBalance: z.number().optional(),
    runType: runTypeSchema.optional(),
    errorLog: z.string().nullable().optional(),
    customAttributes: z.record(z.string(), z.unknown()).optional(),
    status: runStatusSchema.optional(),
  }),
  response: apiResponseSchema.extend({
    data: runItemSchema,
  }),
};

// ==================== DELETE /strategies/:strategyid/versions/:versionid/runs/:id ====================

export const deleteRun = {
  params: z.object({
    strategyid: z.string(),
    versionid: z.string(),
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: z.undefined(),
  }),
};
