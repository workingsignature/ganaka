import { z } from "zod";
import { apiResponseSchema } from "../common";

// ==================== GET /health ====================

export const getHealth = {
  response: apiResponseSchema.extend({
    data: z.object({
      status: z.literal("ok"),
      timestamp: z.string().datetime(),
    }),
  }),
};
