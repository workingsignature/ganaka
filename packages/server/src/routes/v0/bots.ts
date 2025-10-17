import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../helpers/prisma";
import { z } from "zod";
import { validateRequest } from "../../helpers/validator";

const botsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/bots",
    {
      schema: {
        tags: ["Bots"],
        summary: "Get all bots for the authenticated user",
        description: "Retrieves all bots owned by the authenticated user",
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          401: {
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
        // Authentication is handled by userAuthPlugin
        // The request now has user information attached
        const user = request.user;

        // get bots
        // const bots = await prisma.bot.findMany({
        //   where: {
        //     owner: {
        //       clerkId: user.clerkId,
        //     },
        //   },
        // });

        // // return
        // return reply.send({
        //   data: bots,
        // });
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
  // ---------------------------------------------------------------
  fastify.post(
    "/bots",
    {
      schema: {
        tags: ["Bots"],
        summary: "Create a new bot",
        description: "Creates a new bot for the authenticated user",
        body: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the bot",
            },
          },
          required: ["name"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
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
          401: {
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
        // const authenticatedRequest = await requireAuth(request, reply);
        // if (!authenticatedRequest) {
        //   return;
        // }
        // // validate request
        // const validatedBody = validateRequest(
        //   request.body,
        //   reply,
        //   z.object({
        //     name: z.string(),
        //   })
        // );
        // if (!validatedBody) {
        //   return;
        // }
        // // check if bot already exists
        // const existingBot = await prisma.bot.findFirst({
        //   where: {
        //     name: validatedBody.name,
        //     owner: {
        //       clerkId: authenticatedRequest.user.clerkId,
        //     },
        //   },
        // });
        // if (existingBot) {
        //   return reply.badRequest("Bot with this name already exists.");
        // }
        // // create bot
        // const bot = await prisma.bot.create({
        //   data: {
        //     name: validatedBody.name,
        //     owner: {
        //       connect: {
        //         clerkId: authenticatedRequest.user.clerkId,
        //       },
        //     },
        //   },
        // });
        // // return
        // return reply.send({
        //   data: bot,
        // });
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
  // ---------------------------------------------------------------
  fastify.put(
    "/bots/:id",
    {
      schema: {
        tags: ["Bots"],
        summary: "Update a bot",
        description: "Updates an existing bot owned by the authenticated user",
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Bot ID",
            },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "New name for the bot",
            },
          },
          required: ["name"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
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
          401: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
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
        // // authenticate user
        // const authenticatedRequest = await requireAuth(request, reply);
        // if (!authenticatedRequest) {
        //   return;
        // }
        // // validate request
        // const validatedBody = validateRequest(
        //   request.body,
        //   reply,
        //   z.object({
        //     name: z.string(),
        //   })
        // );
        // const validatedParams = validateRequest(
        //   request.params,
        //   reply,
        //   z.object({
        //     id: z.string(),
        //   })
        // );
        // if (!validatedBody || !validatedParams) {
        //   return;
        // }
        // // check if bot exists
        // const existingBot = await prisma.bot.findFirst({
        //   where: {
        //     id: validatedParams.id,
        //     owner: {
        //       clerkId: authenticatedRequest.user.clerkId,
        //     },
        //   },
        // });
        // if (!existingBot) {
        //   return reply.notFound("Bot with this id does not exist.");
        // }
        // // update bot
        // const updatedBot = await prisma.bot.update({
        //   where: { id: validatedParams.id },
        //   data: {
        //     name: validatedBody.name,
        //   },
        // });
        // // return
        // return reply.send({
        //   data: updatedBot,
        // });
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
  // ---------------------------------------------------------------
  fastify.delete(
    "/bots/:id",
    {
      schema: {
        tags: ["Bots"],
        summary: "Delete a bot",
        description: "Deletes an existing bot owned by the authenticated user",
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Bot ID",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string" },
                },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
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
        // // authenticate user
        // const authenticatedRequest = await requireAuth(request, reply);
        // if (!authenticatedRequest) {
        //   return;
        // }
        // // validate request
        // const validatedParams = validateRequest(
        //   request.params,
        //   reply,
        //   z.object({
        //     id: z.string(),
        //   })
        // );
        // if (!validatedParams) {
        //   return;
        // }
        // // check if bot exists
        // const existingBot = await prisma.bot.findFirst({
        //   where: {
        //     id: validatedParams.id,
        //     owner: {
        //       clerkId: authenticatedRequest.user.clerkId,
        //     },
        //   },
        // });
        // if (!existingBot) {
        //   return reply.notFound("Bot with this id does not exist.");
        // }
        // // delete bot
        // await prisma.bot.delete({
        //   where: { id: validatedParams.id },
        // });
        // // return
        // return reply.send({
        //   data: { message: "Bot deleted successfully." },
        // });
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError("An unexpected error occurred.");
      }
    }
  );
};

export default botsRoutes;
