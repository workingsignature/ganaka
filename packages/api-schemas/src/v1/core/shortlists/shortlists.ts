import { z } from "zod";

// ==================== Schemas ====================

/**
 * Instrument Summary Schema (nested in shortlist responses)
 */
export const instrumentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
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
  response: z.array(shortlistItemSchema),
};

// ==================== POST /shortlists ====================

export const createShortlist = {
  body: z.object({
    name: z.string(),
    instruments: z.array(z.string()),
  }),
  response: shortlistItemSchema,
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
  response: shortlistItemSchema,
};

// ==================== DELETE /shortlists/:id ====================

export const deleteShortlist = {
  params: z.object({
    id: z.string(),
  }),
  response: z.undefined(),
};

