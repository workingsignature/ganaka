import { FastifyPluginAsync } from "fastify";
import { strategiesSchemas } from "@ganaka/api-schemas";
import { InputJsonValue } from "../../../../../generated/prisma/runtime/library";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { validateRequest } from "../../../../helpers/validator";
import z from "zod";

const strategiesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
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
        sendResponse<z.infer<typeof strategiesSchemas.getStrategies.response>>({
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
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.get("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        strategiesSchemas.getStrategy.params
      );
      if (!validatedParams) {
        return;
      }

      // get strategies
      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.id,
          owner: {
            id: user.id,
          },
        },
        include: {
          versions: true,
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to view this strategy"
        );
      }

      // return
      return reply.send(
        sendResponse<z.infer<typeof strategiesSchemas.getStrategy.response>>({
          statusCode: 200,
          message: "Strategy fetched successfully",
          data: {
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
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.post("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedBody = validateRequest(
        request.body,
        reply,
        strategiesSchemas.createStrategy.body
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
          customAttributes: validatedBody.customAttributes as InputJsonValue,
          owner: {
            connect: { id: user.id },
          },
        },
      });

      // return
      return reply.send(
        sendResponse<z.infer<typeof strategiesSchemas.createStrategy.response>>(
          {
            statusCode: 200,
            message: "Strategy created successfully",
            data: {
              id: strategy.id,
              name: strategy.name,
              description: strategy.description,
              isPublic: strategy.isPublic,
              customAttributes: strategy.customAttributes,
            },
          }
        )
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.delete("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        strategiesSchemas.deleteStrategy.params
      );
      if (!validatedParams) {
        return;
      }

      // check if strategy exists
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

      // delete strategy
      await prisma.strategy.delete({
        where: { id: validatedParams.id },
      });

      // return
      return reply.send(
        sendResponse<z.infer<typeof strategiesSchemas.deleteStrategy.response>>(
          {
            statusCode: 200,
            message: "Strategy deleted successfully",
            data: undefined,
          }
        )
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.put("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        strategiesSchemas.updateStrategy.params
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        strategiesSchemas.updateStrategy.body
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      // check if strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: { id: validatedParams.id, owner: { id: user.id } },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to update this strategy"
        );
      }

      // check if name is already taken
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

      // update strategy
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

      // return
      return reply.send(
        sendResponse<z.infer<typeof strategiesSchemas.updateStrategy.response>>(
          {
            statusCode: 200,
            message: "Strategy updated successfully",
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
          }
        )
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default strategiesRoutes;
