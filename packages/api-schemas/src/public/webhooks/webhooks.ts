import { z } from "zod";

// ==================== POST /webhooks/user ====================

/**
 * Clerk webhook response schema
 */
export const clerkUserWebhook = {
  body: z.unknown(), // Clerk webhook payload is verified by @clerk/fastify
  response: z.object({
    message: z.string(),
  }),
};

