import { z } from "zod";

// ==================== Schemas ====================

/**
 * Strategy Version Summary (nested in strategy responses)
 */
export const strategyVersionSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
});

/**
 * Strategy Item Schema
 */
export const strategyItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  customAttributes: z.unknown().optional(),
  versions: z.array(strategyVersionSummarySchema).optional(),
});

// ==================== GET /strategies ====================

export const getStrategies = {
  query: z.object({}).optional(),
  response: z.array(strategyItemSchema),
};

// ==================== GET /strategies/:id ====================

export const getStrategy = {
  params: z.object({
    id: z.string(),
  }),
  response: strategyItemSchema,
};

// ==================== POST /strategies ====================

export const createStrategy = {
  body: z.object({
    name: z.string(),
    description: z.string(),
    isPublic: z.boolean(),
    customAttributes: z.record(z.unknown()).optional().default({}),
  }),
  response: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isPublic: z.boolean(),
    customAttributes: z.unknown().optional(),
  }),
};

// ==================== PUT /strategies/:id ====================

export const updateStrategy = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    customAttributes: z.record(z.unknown()).optional(),
  }),
  response: strategyItemSchema,
};

// ==================== DELETE /strategies/:id ====================

export const deleteStrategy = {
  params: z.object({
    id: z.string(),
  }),
  response: z.undefined(),
};

