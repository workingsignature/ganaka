import { FastifyPluginAsync } from "fastify";
import z from "zod";
import { prisma } from "../../helpers/prisma";
import { validateRequest } from "../../helpers/validator";

const instrumentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/instruments/search", async (request, reply) => {
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
  });
};

export default instrumentsRoutes;
