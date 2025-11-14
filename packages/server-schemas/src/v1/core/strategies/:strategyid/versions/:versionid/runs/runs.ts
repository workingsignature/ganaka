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
 * Run Item Schema
 */
export const runItemSchema = z.object({
  id: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
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
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
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
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
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
