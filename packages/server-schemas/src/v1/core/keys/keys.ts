import { z } from "zod";
import { apiResponseSchema } from "../../../common";

// ==================== Schemas ====================

/**
 * Developer Key Item Schema
 */
export const developerKeyItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  key: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ==================== GET /keys ====================

export const getKeys = {
  query: z.object({}).optional(),
  response: apiResponseSchema.extend({
    data: z.array(developerKeyItemSchema),
  }),
};

// ==================== POST /keys ====================

export const createKey = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: developerKeyItemSchema,
  }),
};

// ==================== PATCH /keys/:id/deactivate ====================

export const deactivateKey = {
  params: z.object({
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: developerKeyItemSchema,
  }),
};
