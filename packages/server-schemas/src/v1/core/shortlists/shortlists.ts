import { z } from "zod";
import { apiResponseSchema } from "../../../common";

// ==================== Schemas ====================

/**
 * Instrument Summary Schema (nested in shortlist responses)
 */
export const instrumentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
});

/**
 * Shortlist Item Schema
 */
export const shortlistItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  instruments: z.array(instrumentSummarySchema),
});

// ==================== GET /shortlists ====================

export const getShortlists = {
  query: z.object({}).optional(),
  response: apiResponseSchema.extend({
    data: z.array(shortlistItemSchema),
  }),
};

// ==================== GET /shortlists/:id ====================

export const getShortlist = {
  params: z.object({
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: shortlistItemSchema,
  }),
};

// ==================== POST /shortlists ====================

export const createShortlist = {
  body: z.object({
    name: z.string(),
    instruments: z.array(z.string()),
  }),
  response: apiResponseSchema.extend({
    data: shortlistItemSchema,
  }),
};

// ==================== PUT /shortlists/:id ====================

export const updateShortlist = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string(),
    instruments: z.array(z.string()),
  }),
  response: apiResponseSchema.extend({
    data: shortlistItemSchema,
  }),
};

// ==================== DELETE /shortlists/:id ====================

export const deleteShortlist = {
  params: z.object({
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: z.undefined(),
  }),
};
