import { z } from "zod";
import { apiResponseSchema } from "../../../common";
import {
  runItemSchema,
  runStatusSchema,
} from "../../core/strategies/:strategyid/versions/:versionid/runs/runs";

// ==================== GET /v1/developer/runs ====================

export const getRuns = {
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

