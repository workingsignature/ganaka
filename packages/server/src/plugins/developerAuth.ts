/// <reference path="../fastify.d.ts" />
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { validateRequest } from "../helpers/validator";
import z from "zod";
import { prisma } from "../helpers/prisma";
import { DeveloperKeyStatus } from "../../generated/prisma";

/**
 * Developer Authentication Plugin
 *
 * This plugin automatically authenticates developers for /v1/developer routes using developer keys.
 * These APIs are accessed by developers who are accessing the APIs through their own keys (Bots).
 * These are NOT users who are accessing the APIs through the web client app.
 */
const developerAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      // validate request
      const validHeaders = validateRequest(
        request.headers,
        reply,
        z.object({
          developerKey: z.string().min(1),
          developerId: z.string().min(1),
        })
      );
      if (!validHeaders) {
        return;
      }

      // validate developer key
      const developerKey = validHeaders.developerKey;
      const developer = await prisma.developerKeys.findUnique({
        where: {
          key: developerKey,
          user: {
            id: validHeaders.developerId,
          },
        },
        include: {
          user: true,
        },
      });
      if (!developer || developer?.status !== DeveloperKeyStatus.ACTIVE) {
        return reply.unauthorized(
          "Authorization failed for this developer request. Please check your credentials and try again."
        );
      }

      // Attach developer to request
      request.developer = {
        id: developer.id,
      };

      // Authentication successful, continue to the route handler
      fastify.log.info(`Developer authenticated: ${request.developer.id}`);
    } catch (error) {
      fastify.log.error(error);
      reply.internalServerError(
        "Authentication failed due to an internal error."
      );
      return;
    }
  });

  fastify.log.info(
    "Developer authentication plugin loaded for /v1/developer routes"
  );
};

export default developerAuthPlugin;
