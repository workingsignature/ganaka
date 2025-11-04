import { z } from "zod";
import { apiResponseSchema, paginationInfoSchema } from "../../../common";

// ==================== Schemas ====================

/**
 * Instrument Item Schema
 */
export const instrumentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  exchange: z.string(),
});

// ==================== GET /instruments ====================

export const getInstruments = {
  query: z.object({
    query: z.string().optional(),
    pageno: z.number().optional(),
    pagesize: z.number().optional(),
  }),
  response: apiResponseSchema.extend({
    data: z.object({
      instruments: z.array(instrumentItemSchema),
      paginationInfo: paginationInfoSchema,
    }),
  }),
};

// ==================== GET /instruments/:id ====================

export const getInstrument = {
  params: z.object({
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: instrumentItemSchema,
  }),
};
