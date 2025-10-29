import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../../helpers/prisma";
import { z } from "zod";
import { validateRequest } from "../../../../helpers/validator";
import {
  DeveloperKeyStatus,
  ShortlistType,
} from "../../../../../generated/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import {
  InputJsonValue,
  JsonValue,
} from "../../../../../generated/prisma/runtime/library";

const strategiesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      const user = request.user;

      // get strategies
      const strategies = await prisma.strategy.findMany({
        where: {
          owner: {
            id: user.id,
          },
        },
        include: {
          versions: true,
        },
      });

      // return
      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Strategies fetched successfully",
          data: strategies.map((strategy) => ({
            id: strategy.id,
            name: strategy.name,
            description: strategy.description,
            isPublic: strategy.isPublic,
            customAttributes: strategy.customAttributes,
            versions: strategy.versions.map((version) => ({
              id: version.id,
              name: version.name,
              version: version.version,
            })),
          })),
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.post("/", async (request, reply) => {
    try {
      const user = request.user;

      // validate request
      const validatedBody = validateRequest(
        request.body,
        reply,
        z.object({
          name: z.string(),
          description: z.string(),
          isPublic: z.boolean(),
          customAttributes: z.object({}).optional().default({}),
        })
      );
      if (!validatedBody) {
        return;
      }
      // check if strategy already exists
      const existingStrategy = await prisma.strategy.findFirst({
        where: {
          name: validatedBody.name,
          owner: {
            id: user.id,
          },
        },
      });
      if (existingStrategy) {
        return reply.badRequest(
          "Strategy with this name already exists for this user."
        );
      }

      // create strategy
      const strategy = await prisma.strategy.create({
        data: {
          name: validatedBody.name,
          description: validatedBody.description,
          isPublic: validatedBody.isPublic,
          customAttributes: validatedBody.customAttributes,
          owner: {
            connect: { id: user.id },
          },
        },
      });

      // return
      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Strategy created successfully",
          data: {
            id: strategy.id,
            name: strategy.name,
            description: strategy.description,
            isPublic: strategy.isPublic,
            customAttributes: strategy.customAttributes,
          },
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.delete("/:id", async (request, reply) => {
    try {
      const user = request.user;

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

      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.id,
          owner: {
            id: user.id,
          },
        },
      });

      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to delete this strategy"
        );
      }

      await prisma.strategy.delete({
        where: { id: validatedParams.id },
      });

      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Strategy deleted successfully",
          data: undefined,
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.put("/:id", async (request, reply) => {
    try {
      const user = request.user;
      const validatedParams = validateRequest(
        request.params,
        reply,
        z.object({
          id: z.string(),
        })
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          isPublic: z.boolean().optional(),
          customAttributes: z.object({}).optional(),
        })
      );

      if (!validatedParams || !validatedBody) {
        return;
      }

      // ----------------------------------------

      const strategy = await prisma.strategy.findUnique({
        where: { id: validatedParams.id, owner: { id: user.id } },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to update this strategy"
        );
      }
      if (validatedBody.name) {
        if (validatedBody.name !== strategy.name) {
          const existingStrategy = await prisma.strategy.findFirst({
            where: {
              name: validatedBody.name,
              owner: {
                id: user.id,
              },
            },
          });
          if (existingStrategy) {
            return reply.badRequest(
              "A strategy with this name already exists for this user."
            );
          }
        }
      }

      // ----------------------------------------

      const updatedStrategy = await prisma.strategy.update({
        where: { id: validatedParams.id, owner: { id: user.id } },
        data: {
          name: validatedBody.name ?? strategy.name,
          description: validatedBody.description ?? strategy.description,
          isPublic: validatedBody.isPublic ?? strategy.isPublic,
          customAttributes:
            (validatedBody.customAttributes as InputJsonValue) ??
            (strategy.customAttributes as InputJsonValue),
        },
        include: {
          versions: true,
        },
      });

      // ----------------------------------------

      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Shortlist updated successfully",
          data: {
            id: updatedStrategy.id,
            name: updatedStrategy.name,
            description: updatedStrategy.description,
            isPublic: updatedStrategy.isPublic,
            customAttributes: updatedStrategy.customAttributes,
            versions: updatedStrategy.versions.map((version) => ({
              id: version.id,
              name: version.name,
              version: version.version,
            })),
          },
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default strategiesRoutes;
