import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../helpers/prisma";
import { z } from "zod";
import { validateRequest } from "../../../helpers/validator";
import { DeveloperKeyStatus } from "../../../../generated/prisma";

const developerKeyRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/keys", async (request, reply) => {
    try {
      // Authentication is handled by userAuthPlugin
      // The request now has user information attached
      const user = request.user;

      // get developer key
      const developerKeys = await prisma.developerKeys.findMany({
        where: {
          user: {
            id: user.id,
          },
        },
      });

      // return
      return reply.send({
        statusCode: 200,
        data: developerKeys.map((key) => {
          return {
            id: key.id,
            key: key.key,
            status: key.status,
            createdAt: key.createdAt,
            updatedAt: key.updatedAt,
          };
        }),
      });
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.post("/keys", async (request, reply) => {
    try {
      const user = request.user;

      // create developer key
      const developerKey = await prisma.developerKeys.create({
        data: {
          key: crypto.randomUUID(),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      // return
      return reply.send({
        statusCode: 200,
        message: "Developer key created successfully",
        data: {
          id: developerKey.id,
          key: developerKey.key,
          status: developerKey.status,
          createdAt: developerKey.createdAt,
          updatedAt: developerKey.updatedAt,
        },
      });
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.patch("/keys/:id/deactivate", async (request, reply) => {
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

      // get developer key
      const developerKeyToUpdate = await prisma.developerKeys.findUnique({
        where: { id: validatedParams.id, user: { id: user.id } },
      });
      if (!developerKeyToUpdate) {
        return reply.notFound(
          "Developer key not found or you are not authorized to deactivate this key"
        );
      }
      if (developerKeyToUpdate.status === DeveloperKeyStatus.INACTIVE) {
        return reply.badRequest("Developer key is already deactivated");
      }

      // deactivate developer key
      const developerKey = await prisma.developerKeys.update({
        where: { id: validatedParams.id, user: { clerkId: user.clerkId } },
        data: { status: DeveloperKeyStatus.INACTIVE },
      });

      // return
      return reply.send({
        statusCode: 200,
        message: "Developer key deactivated successfully",
        data: {
          id: developerKey.id,
          key: developerKey.key,
          status: developerKey.status,
          createdAt: developerKey.createdAt,
          updatedAt: developerKey.updatedAt,
        },
      });
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default developerKeyRoutes;
