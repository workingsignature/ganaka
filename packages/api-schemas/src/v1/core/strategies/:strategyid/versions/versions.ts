import { z } from "zod";
import semver from "semver";

// ==================== Schemas ====================

/**
 * Strategy Version Item Schema
 */
export const versionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  customAttributes: z.unknown().optional(),
});

// ==================== GET /strategies/:strategyid/versions ====================

export const getVersions = {
  params: z.object({
    strategyid: z.string(),
  }),
  response: z.array(versionItemSchema),
};

// ==================== GET /strategies/:strategyid/versions/:id ====================

export const getVersion = {
  params: z.object({
    strategyid: z.string(),
    id: z.string(),
  }),
  response: versionItemSchema,
};

// ==================== POST /strategies/:strategyid/versions ====================

export const createVersion = {
  params: z.object({
    strategyid: z.string(),
  }),
  body: z.object({
    name: z.string(),
    version: z.string().refine((version) => semver.valid(version), {
      message: "Invalid version format",
    }),
    customAttributes: z.record(z.string(), z.unknown()).optional().default({}),
  }),
  response: versionItemSchema,
};

// ==================== PUT /strategies/:strategyid/versions/:id ====================

export const updateVersion = {
  params: z.object({
    strategyid: z.string(),
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    version: z
      .string()
      .refine((version) => semver.valid(version), {
        message: "Invalid version format",
      })
      .optional(),
    customAttributes: z.record(z.string(), z.unknown()).optional(),
  }),
  response: versionItemSchema,
};

// ==================== DELETE /strategies/:strategyid/versions/:id ====================

export const deleteVersion = {
  params: z.object({
    strategyid: z.string(),
    id: z.string(),
  }),
  response: z.undefined(),
};

