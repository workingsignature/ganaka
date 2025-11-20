import { v1_developer_runs_orders_schemas } from "@ganaka/server-schemas";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Prisma } from "../../../../../../../generated/prisma";
import { prisma } from "../../../../../../helpers/prisma";
import { sendResponse } from "../../../../../../helpers/sendResponse";
import { validateRequest } from "../../../../../../helpers/validator";

const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  // ==================== POST /developer/runs/:id/orders ====================
  fastify.post("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_orders_schemas.placeOrder.params,
        "params"
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_developer_runs_orders_schemas.placeOrder.body,
        "body"
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_orders_schemas.placeOrder.params
      >;
      const body = validatedBody as z.infer<
        typeof v1_developer_runs_orders_schemas.placeOrder.body
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
        where: {
          id: params.id,
          version: {
            strategy: {
              owner: {
                id: user.id,
              },
            },
          },
        },
      });
      if (!existingRun) {
        return reply.notFound(
          "Run not found or you are not authorized to place orders for this run"
        );
      }

      // validate that instrument exists
      const instrument = await prisma.instrument.findUnique({
        where: { id: body.instrumentId },
      });
      if (!instrument) {
        return reply.notFound("Instrument not found");
      }

      // validate price requirement for limit/stop orders
      if (
        (body.orderType === "BUY_LIMIT" ||
          body.orderType === "SELL_LIMIT" ||
          body.orderType === "BUY_STOP" ||
          body.orderType === "SELL_STOP") &&
        !body.price
      ) {
        return reply.badRequest("Price is required for limit and stop orders");
      }

      // create order
      const order = await prisma.order.create({
        data: {
          runId: params.id,
          instrumentId: body.instrumentId,
          orderType: body.orderType,
          orderStatus: "PENDING",
          quantity: body.quantity,
          price: body.price ?? null,
          stopLoss: body.stopLoss ?? null,
          target: body.target ?? null,
          metadata: body.metadata
            ? (body.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_orders_schemas.placeOrder.response>
        >({
          statusCode: 200,
          message: "Order placed successfully",
          data: {
            id: order.id,
            runId: order.runId,
            instrumentId: order.instrumentId,
            orderType: order.orderType,
            orderStatus: order.orderStatus,
            quantity: order.quantity,
            price: order.price,
            stopLoss: order.stopLoss,
            target: order.target,
            filledPrice: order.filledPrice,
            filledQuantity: order.filledQuantity,
            filledAt: order.filledAt?.toISOString() ?? null,
            metadata: order.metadata as Record<string, unknown> | null,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });

  // ==================== GET /developer/runs/:id/orders ====================
  fastify.get("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_orders_schemas.getOrders.params,
        "params"
      );
      const validatedQuery = validateRequest(
        request.query,
        reply,
        v1_developer_runs_orders_schemas.getOrders.query,
        "query"
      );
      if (!validatedParams || !validatedQuery) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_orders_schemas.getOrders.params
      >;
      const query = validatedQuery as z.infer<
        typeof v1_developer_runs_orders_schemas.getOrders.query
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
        where: {
          id: params.id,
          version: {
            strategy: {
              owner: {
                id: user.id,
              },
            },
          },
        },
      });
      if (!existingRun) {
        return reply.notFound(
          "Run not found or you are not authorized to view orders for this run"
        );
      }

      // build where clause
      const where: {
        runId: string;
        orderStatus?: "PENDING" | "FILLED" | "CANCELLED" | "FAILED";
        instrumentId?: string;
      } = {
        runId: params.id,
      };

      if (query.status) {
        where.orderStatus = query.status as
          | "PENDING"
          | "FILLED"
          | "CANCELLED"
          | "FAILED";
      }

      if (query.instrumentId) {
        where.instrumentId = query.instrumentId;
      }

      // get orders
      const orders = await prisma.order.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_orders_schemas.getOrders.response>
        >({
          statusCode: 200,
          message: "Orders fetched successfully",
          data: orders.map((order) => ({
            id: order.id,
            runId: order.runId,
            instrumentId: order.instrumentId,
            orderType: order.orderType as
              | "BUY"
              | "SELL"
              | "BUY_LIMIT"
              | "SELL_LIMIT"
              | "BUY_STOP"
              | "SELL_STOP",
            orderStatus: order.orderStatus as
              | "PENDING"
              | "FILLED"
              | "CANCELLED"
              | "FAILED",
            quantity: order.quantity,
            price: order.price,
            stopLoss: order.stopLoss,
            target: order.target,
            filledPrice: order.filledPrice,
            filledQuantity: order.filledQuantity,
            filledAt: order.filledAt?.toISOString() ?? null,
            metadata: order.metadata as Record<string, unknown> | null,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          })),
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });

  // ==================== GET /developer/runs/:id/orders/:orderId ====================
  fastify.get("/:orderid", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_orders_schemas.getOrder.params,
        "params"
      );
      if (!validatedParams) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_orders_schemas.getOrder.params
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
        where: {
          id: params.id,
          version: {
            strategy: {
              owner: {
                id: user.id,
              },
            },
          },
        },
      });
      if (!existingRun) {
        return reply.notFound(
          "Run not found or you are not authorized to view orders for this run"
        );
      }

      // get order
      const order = await prisma.order.findFirst({
        where: {
          id: params.orderid,
          runId: params.id,
        },
      });

      if (!order) {
        return reply.notFound("Order not found or does not belong to this run");
      }

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_orders_schemas.getOrder.response>
        >({
          statusCode: 200,
          message: "Order fetched successfully",
          data: {
            id: order.id,
            runId: order.runId,
            instrumentId: order.instrumentId,
            orderType: order.orderType,
            orderStatus: order.orderStatus,
            quantity: order.quantity,
            price: order.price,
            stopLoss: order.stopLoss,
            target: order.target,
            filledPrice: order.filledPrice,
            filledQuantity: order.filledQuantity,
            filledAt: order.filledAt?.toISOString() ?? null,
            metadata: order.metadata as Record<string, unknown> | null,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });

  // ==================== DELETE /developer/runs/:id/orders/:orderId ====================
  fastify.delete("/:orderId", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_orders_schemas.cancelOrder.params,
        "params"
      );
      if (!validatedParams) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_orders_schemas.cancelOrder.params
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
        where: {
          id: params.id,
          version: {
            strategy: {
              owner: {
                id: user.id,
              },
            },
          },
        },
      });
      if (!existingRun) {
        return reply.notFound(
          "Run not found or you are not authorized to cancel orders for this run"
        );
      }

      // check if order exists and belongs to run
      const existingOrder = await prisma.order.findFirst({
        where: {
          id: params.orderId,
          runId: params.id,
        },
      });

      if (!existingOrder) {
        return reply.notFound("Order not found or does not belong to this run");
      }

      // only allow cancellation of PENDING orders
      if (existingOrder.orderStatus !== "PENDING") {
        return reply.badRequest("Only PENDING orders can be cancelled");
      }

      // update order status to CANCELLED
      const order = await prisma.order.update({
        where: { id: params.orderId },
        data: {
          orderStatus: "CANCELLED",
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_orders_schemas.cancelOrder.response>
        >({
          statusCode: 200,
          message: "Order cancelled successfully",
          data: {
            id: order.id,
            runId: order.runId,
            instrumentId: order.instrumentId,
            orderType: order.orderType,
            orderStatus: order.orderStatus,
            quantity: order.quantity,
            price: order.price,
            stopLoss: order.stopLoss,
            target: order.target,
            filledPrice: order.filledPrice,
            filledQuantity: order.filledQuantity,
            filledAt: order.filledAt?.toISOString() ?? null,
            metadata: order.metadata as Record<string, unknown> | null,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default ordersRoutes;
