import { z } from "zod";
import { apiResponseSchema, paginationInfoSchema } from "../../../common";

// ==================== Schemas ====================

/**
 * Instrument Item Schema
 */
export const instrumentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  exchange: z.string(),
});

// ==================== GET /instruments ====================

export const getInstruments = {
  query: z.object({
    query: z.string().optional(),
    pageno: z.coerce.number().optional(),
    pagesize: z.coerce.number().optional(),
    categories: z
      .string()
      .optional()
      .describe(
        "Comma-separated category values in format: 'broad-sector:id,sector:id,broad-industry:id,industry:id'"
      ),
  }),
  response: apiResponseSchema.extend({
    data: z.object({
      instruments: z.array(instrumentItemSchema),
      paginationInfo: paginationInfoSchema,
    }),
  }),
};

// ==================== GET /instruments/:id ====================

export const getInstrument = {
  params: z.object({
    id: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: instrumentItemSchema,
  }),
};

// ==================== GET /instruments/filter-tree ====================

export const treeNodeSchema: z.ZodType<{
  label: string;
  value: string;
  children?: Array<{
    label: string;
    value: string;
    children?: any[];
  }>;
}> = z.lazy(() =>
  z.object({
    label: z.string(),
    value: z.string(),
    children: z.array(treeNodeSchema).optional(),
  })
);

export const getInstrumentsFilterTree = {
  response: apiResponseSchema.extend({
    data: z.object({
      tree: z.array(treeNodeSchema),
    }),
  }),
};
