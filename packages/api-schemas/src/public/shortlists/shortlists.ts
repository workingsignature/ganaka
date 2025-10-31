import { z } from "zod";

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
  response: z.array(publicShortlistItemSchema),
};
