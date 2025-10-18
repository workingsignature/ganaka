import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { validateRequest } from "../../../helpers/validator";
import { prisma } from "../../../helpers/prisma";

const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/session/bot/:id", async (request, reply) => {
    try {
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        z.object({
          id: z.string(),
        })
      );
      if (!validatedParams) {
        return;
      }

      // get bot
      const bot = await prisma.bot.findUnique({
        where: { id: validatedParams.id },
        include: {
          owner: true,
        },
      });
      if (!bot) {
        return reply.notFound(
          "Bot not found or you are not authorized to access this bot"
        );
      }
      if (bot.owner.id !== user.id) {
        return reply.unauthorized("You are not authorized to access this bot");
      }

      // return
      return reply.send({
        statusCode: 200,
        data: {},
      });
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default sessionRoutes;
