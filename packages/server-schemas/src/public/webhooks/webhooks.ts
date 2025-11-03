import { z } from "zod";
import { apiResponseSchema } from "../../common";

// ==================== POST /webhooks/user ====================

/**
 * Clerk webhook response schema
 */
export const clerkUserWebhook = {
  body: z.unknown(), // Clerk webhook payload is verified by @clerk/fastify
  response: apiResponseSchema.extend({
    data: z.object({
      message: z.string(),
    }),
  }),
};
