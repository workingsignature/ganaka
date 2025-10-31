import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../../helpers/prisma";
import { z } from "zod";
import { validateRequest } from "../../../../helpers/validator";
import { DeveloperKeyStatus } from "../../../../../generated/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { v1_core_keys_schemas } from "@ganaka/server-schemas";

const keysRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
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
      return reply.send(
        sendResponse<z.infer<typeof v1_core_keys_schemas.getKeys.response>>({
          statusCode: 200,
          message: "Developer keys fetched successfully",
          data: developerKeys.map((key) => ({
            id: key.id,
            key: key.key,
            status: key.status,
            createdAt: key.createdAt,
            updatedAt: key.updatedAt,
          })),
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
      return reply.send(
        sendResponse<z.infer<typeof v1_core_keys_schemas.createKey.response>>({
          statusCode: 200,
          message: "Developer key created successfully",
          data: {
            id: developerKey.id,
            key: developerKey.key,
            status: developerKey.status,
            createdAt: developerKey.createdAt,
            updatedAt: developerKey.updatedAt,
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.patch("/:id/deactivate", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_keys_schemas.deactivateKey.params
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
      return reply.send(
        sendResponse<
          z.infer<typeof v1_core_keys_schemas.deactivateKey.response>
        >({
          statusCode: 200,
          message: "Developer key deactivated successfully",
          data: {
            id: developerKey.id,
            key: developerKey.key,
            status: developerKey.status,
            createdAt: developerKey.createdAt,
            updatedAt: developerKey.updatedAt,
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default keysRoutes;
