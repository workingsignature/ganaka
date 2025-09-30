import { FastifyPluginAsync } from "fastify";
import z from "zod";
import { prisma } from "../../helpers/prisma";
import { validateRequest } from "../../helpers/validator";

const instrumentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/instruments/search",
    {
      schema: {
        tags: ["Instruments"],
        summary: "Search instruments",
        description: "Search for instruments by trading symbol or name",
        querystring: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Search query to match against trading symbol or name",
            },
          },
          required: ["query"],
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                trading_symbol: { type: "string" },
                name: { type: "string" },
                groww_symbol: { type: "string" },
                exchange: { type: "string" },
                exchange_token: { type: "string" },
                instrument_type: { type: "string" },
                segment: { type: "string" },
                lot_size: { type: "number" },
                tick_size: { type: "number" },
                isin: { type: "string" },
                expiry: { type: "string", format: "date" },
                strike: { type: "number" },
                option_type: { type: "string" },
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
        const validatedQuery = validateRequest(
          request.query,
          reply,
          z.object({
            query: z.string(),
          })
        );
        if (!validatedQuery) {
          return reply.badRequest("Query is required.");
        }

        const instruments = await prisma.instrument.findMany({
          where: {
            OR: [
              {
                trading_symbol: {
                  contains: validatedQuery.query,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: validatedQuery.query,
                  mode: "insensitive",
                },
              },
            ],
          },
        });

        return reply.send(instruments);
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
};

export default instrumentsRoutes;
