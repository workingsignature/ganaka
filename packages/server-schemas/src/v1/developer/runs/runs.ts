import { z } from "zod";
import { apiResponseSchema } from "../../../common";
import {
  runItemSchema,
  runStatusSchema,
} from "../../core/strategies/:strategyid/versions/:versionid/runs/runs";

// ==================== Execution Schemas ====================

export const executionStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
]);

export const executionItemSchema = z.object({
  id: z.string(),
  runId: z.string(),
  executionTime: z.iso.datetime(),
  status: executionStatusSchema,
  executedAt: z.iso.datetime().nullable(),
  errorLog: z.string().nullable(),
  timeslot: z.record(z.string(), z.unknown()).nullable(),
  day: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// ==================== GET /v1/developer/runs ====================

export const getRuns = {
  query: z.object({
    status: runStatusSchema.optional(),
  }),
  response: apiResponseSchema.extend({
    data: z.array(runItemSchema),
  }),
};

// ==================== PUT /v1/developer/runs/:id ====================

export const updateRun = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: runStatusSchema.optional(),
    errorLog: z.string().nullable().optional(),
  }),
  response: apiResponseSchema.extend({
    data: runItemSchema,
  }),
};

// ==================== POST /v1/developer/runs/:id/executions ====================

export const createExecutions = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    executions: z.array(
      z.object({
        executionTime: z.iso.datetime(),
        timeslot: z.record(z.string(), z.unknown()).optional(),
        day: z.string().optional(),
      })
    ),
  }),
  response: apiResponseSchema.extend({
    data: z.array(executionItemSchema),
  }),
};

// ==================== PUT /v1/developer/runs/:id/executions/:executionId ====================

export const updateExecution = {
  params: z.object({
    id: z.string(),
    executionId: z.string(),
  }),
  body: z.object({
    status: executionStatusSchema.optional(),
    executedAt: z.iso.datetime().nullable().optional(),
    errorLog: z.string().nullable().optional(),
  }),
  response: apiResponseSchema.extend({
    data: executionItemSchema,
  }),
};

// ==================== GET /v1/developer/runs/:id/executions ====================

export const getExecutions = {
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    status: executionStatusSchema.optional(),
    incomplete: z
      .string()
      .optional()
      .transform((val) => val === "true" || val === "1"), // Convert URL string to boolean
  }),
  response: apiResponseSchema.extend({
    data: z.array(executionItemSchema),
  }),
};
