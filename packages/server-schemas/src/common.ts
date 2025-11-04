import { z } from "zod";

/**
 * Standard API response wrapper
 */
export const apiResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.unknown(),
});

export const apiErrorResponseSchema = z.object({
  error: z.string(),
  statusCode: z.number(),
  message: z.string(),
});

/**
 * Common parameter schemas
 */
export const idParamSchema = z.object({
  id: z.string(),
});

export const paginationInfoSchema = z.object({
  count: z.number(),
  pageno: z.number(),
  pagesize: z.number(),
});
