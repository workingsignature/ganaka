import { z } from "zod";
import { DeveloperKeyStatus } from "./common";

// ==================== Schemas ====================

/**
 * Developer Key Item Schema
 */
export const developerKeyItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  status: z.nativeEnum(DeveloperKeyStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ==================== GET /keys ====================

export const getKeys = {
  query: z.object({}).optional(),
  response: z.array(developerKeyItemSchema),
};

// ==================== POST /keys ====================

export const createKey = {
  body: z.object({}).optional(),
  response: developerKeyItemSchema,
};

// ==================== PATCH /keys/:id/deactivate ====================

export const deactivateKey = {
  params: z.object({
    id: z.string(),
  }),
  response: developerKeyItemSchema,
};
