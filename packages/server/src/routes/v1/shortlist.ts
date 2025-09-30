import { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../../helpers/auth";
import { z } from "zod";
import { validateRequest } from "../../helpers/validator";
import { prisma } from "../../helpers/prisma";

const shortlistRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/shortlist/:date",
    {
      schema: {
        tags: ["Shortlist"],
        summary: "Get shortlist for a specific date",
        description: "Retrieves the user's shortlist for a given date",
        params: {
          type: "object",
          properties: {
            date: {
              type: "string",
              format: "date",
              description: "Date in YYYY-MM-DD format",
            },
          },
          required: ["date"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  instruments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        symbol: { type: "string" },
                        name: { type: "string" },
                        groww_symbol: { type: "string" },
                        exchange: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // authenticate user
        const authenticatedRequest = await requireAuth(request, reply);
        if (!authenticatedRequest) {
          return;
        }

        // validate request
        const validatedParams = validateRequest(
          request.params,
          reply,
          z.object({
            date: z.string(),
          })
        );
        if (!validatedParams) {
          return;
        }

        // get shortlist
        const shortlist = await prisma.shortlist.findMany({
          where: {
            createdById: authenticatedRequest.user.clerkId,
            forDate: new Date(validatedParams.date),
          },
          include: {
            instruments: true,
          },
        });
        if (!shortlist || shortlist.length === 0) {
          return reply.notFound("No shortlist found for the given date.");
        }

        return reply.send({
          data: {
            id: shortlist[0].id,
            instruments: shortlist[0].instruments.map((instrument) => ({
              id: instrument.id,
              symbol: instrument.trading_symbol,
              name: instrument.name,
              groww_symbol: instrument.groww_symbol,
              exchange: instrument.exchange,
            })),
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
  // ---------------------------------------------------------------
  fastify.put(
    "/shortlist/:date",
    {
      schema: {
        tags: ["Shortlist"],
        summary: "Update shortlist for a specific date",
        description: "Creates or updates the user's shortlist for a given date",
        params: {
          type: "object",
          properties: {
            date: {
              type: "string",
              format: "date",
              description: "Date in YYYY-MM-DD format",
            },
          },
          required: ["date"],
        },
        body: {
          type: "object",
          properties: {
            instruments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
                required: ["id"],
              },
            },
          },
          required: ["instruments"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  instruments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        symbol: { type: "string" },
                        name: { type: "string" },
                        groww_symbol: { type: "string" },
                        exchange: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // authenticate user
        const authenticatedRequest = await requireAuth(request, reply);
        if (!authenticatedRequest) {
          return;
        }

        // validate request
        const validatedParams = validateRequest(
          request.params,
          reply,
          z.object({
            date: z.string(),
            shortlistId: z.string().optional(),
          })
        );
        const validatedBody = validateRequest(
          request.body,
          reply,
          z.object({
            instruments: z.array(
              z.object({
                id: z.string(),
              })
            ),
          })
        );
        if (!validatedParams || !validatedBody) {
          return;
        }

        const shortlist = await prisma.shortlist.upsert({
          where: {
            id: validatedParams.shortlistId,
            createdById: authenticatedRequest.user.clerkId,
            forDate: new Date(validatedParams.date),
          },
          create: {
            id: validatedParams.shortlistId,
            createdById: authenticatedRequest.user.clerkId,
            forDate: new Date(validatedParams.date),
          },
          update: {
            instruments: {
              connect: validatedBody.instruments.map((instrument) => ({
                id: instrument.id,
              })),
            },
          },
          include: {
            instruments: true,
          },
        });

        return reply.send({
          data: {
            id: shortlist.id,
            instruments: shortlist.instruments.map((instrument) => ({
              id: instrument.id,
              symbol: instrument.trading_symbol,
              name: instrument.name,
              groww_symbol: instrument.groww_symbol,
              exchange: instrument.exchange,
            })),
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
};

export default shortlistRoutes;
