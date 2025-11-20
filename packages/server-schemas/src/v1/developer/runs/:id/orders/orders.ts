import { z } from "zod";
import { apiResponseSchema } from "../../../../../common";

// ==================== Order Schemas ====================

export const orderTypeSchema = z.enum([
  "BUY",
  "SELL",
  "BUY_LIMIT",
  "SELL_LIMIT",
  "BUY_STOP",
  "SELL_STOP",
]);

export const orderStatusSchema = z.enum([
  "PENDING",
  "FILLED",
  "CANCELLED",
  "FAILED",
]);

export const orderItemSchema = z.object({
  id: z.string(),
  runId: z.string(),
  instrumentId: z.string(),
  orderType: orderTypeSchema,
  orderStatus: orderStatusSchema,
  quantity: z.number(),
  price: z.number().nullable(),
  stopLoss: z.number().nullable(),
  target: z.number().nullable(),
  filledPrice: z.number().nullable(),
  filledQuantity: z.number().nullable(),
  filledAt: z.iso.datetime().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// ==================== POST /v1/developer/runs/:id/orders ====================

export const placeOrder = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    instrumentId: z.string(),
    orderType: orderTypeSchema,
    quantity: z.number().positive(),
    price: z.number().positive().nullable().optional(),
    stopLoss: z.number().positive().nullable().optional(),
    target: z.number().positive().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  response: apiResponseSchema.extend({
    data: orderItemSchema,
  }),
};

// ==================== GET /v1/developer/runs/:id/orders ====================

export const getOrders = {
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    status: orderStatusSchema.optional(),
    instrumentId: z.string().optional(),
  }),
  response: apiResponseSchema.extend({
    data: z.array(orderItemSchema),
  }),
};

// ==================== GET /v1/developer/runs/:id/orders/:orderId ====================

export const getOrder = {
  params: z.object({
    id: z.string(),
    orderid: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: orderItemSchema,
  }),
};

// ==================== DELETE /v1/developer/runs/:id/orders/:orderId ====================

export const cancelOrder = {
  params: z.object({
    id: z.string(),
    orderId: z.string(),
  }),
  response: apiResponseSchema.extend({
    data: orderItemSchema,
  }),
};
