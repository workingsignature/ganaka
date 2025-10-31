import { z } from "zod";

/**
 * Standard API response wrapper
 */
export const apiResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.unknown(),
});

/**
 * Common parameter schemas
 */
export const idParamSchema = z.object({
  id: z.string(),
});
