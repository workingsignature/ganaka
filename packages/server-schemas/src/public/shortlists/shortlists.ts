import { z } from "zod";
import { apiResponseSchema } from "../../common";

// ==================== Schemas ====================

/**
 * Public Shortlist Item Schema (simplified)
 */
export const publicShortlistItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// ==================== GET /shortlists ====================

export const getPublicShortlists = {
  response: apiResponseSchema.extend({
    data: z.array(publicShortlistItemSchema),
  }),
};
