import { z } from "zod";
import { apiResponseSchema } from "../../../../../../../common";
import { shortlistItemSchema } from "../../../../../shortlists/shortlists";

// ==================== Schemas ====================

export const runTypeSchema = z.enum(["BACKTEST", "LIVE"]);
export const runStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

// Input schemas (for create/update - uses shortlist IDs)
export const daywiseScheduleInputSchema = z.object({
  timeslots: z.array(
    z.object({
      startTime: z.iso.datetime(),
      endTime: z.iso.datetime(),
      interval: z.number(),
    })
  ),
  shortlist: z.array(z.string()), // Array of shortlist IDs
});

export const scheduleInputSchema = z.object({
  startDateTime: z.iso.datetime(),
  endDateTime: z.iso.datetime(),
  daywise: z.object({
    monday: daywiseScheduleInputSchema,
    tuesday: daywiseScheduleInputSchema,
    wednesday: daywiseScheduleInputSchema,
    thursday: daywiseScheduleInputSchema,
    friday: daywiseScheduleInputSchema,
  }),
});

// Output schemas (for responses - includes full shortlist data)
export const daywiseScheduleSchema = z.object({
  timeslots: z.array(
    z.object({
      startTime: z.iso.datetime(),
      endTime: z.iso.datetime(),
      interval: z.number(),
    })
  ),
  shortlist: z.array(shortlistItemSchema),
});

export const scheduleSchema = z.object({
  startDateTime: z.iso.datetime(),
  endDateTime: z.iso.datetime(),
  daywise: z.object({
    monday: daywiseScheduleSchema,
    tuesday: daywiseScheduleSchema,
    wednesday: daywiseScheduleSchema,
    thursday: daywiseScheduleSchema,
    friday: daywiseScheduleSchema,
  }),
});

export const runItemSchema = z.object({
  id: z.string(),
  schedule: scheduleSchema,
  currentBalance: z.number(),
  startingBalance: z.number(),
  endingBalance: z.number(),
  errorLog: z.string().nullable(),
  customAttributes: z.record(z.string(), z.unknown()).optional(),
  runType: runTypeSchema,
  status: runStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
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
    schedule: scheduleInputSchema, // Uses input schema with shortlist IDs
    startingBalance: z.number().min(0, "Starting balance must be >= 0"),
    runType: runTypeSchema,
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
    schedule: scheduleInputSchema.optional(), // Uses input schema with shortlist IDs
    startingBalance: z
      .number()
      .min(0, "Starting balance must be >= 0")
      .optional(),
    currentBalance: z.number().optional(), // Set by platform when run completes
    endingBalance: z.number().optional(), // Set by platform when run completes
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
