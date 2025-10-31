import { z } from "zod";

// ==================== GET /health ====================

export const getHealth = {
  response: z.object({
    status: z.literal("ok"),
    timestamp: z.string().datetime(),
  }),
};

