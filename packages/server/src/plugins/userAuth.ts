/// <reference path="../fastify.d.ts" />
import { verifyToken } from "@clerk/backend";
import { FastifyPluginAsync, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../helpers/prisma";
import { validateRequest } from "../helpers/validator";

/**
 * User Authentication Plugin
 *
 * This plugin automatically authenticates users for /v1 routes using Clerk tokens.
 * These APIs are accessed by users who are accessing the web client app.
 * These are NOT developers who are accessing the APIs through their own keys (Bots).
 */
const userAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      // validate request
      const validHeaders = validateRequest(
        request.headers,
        reply,
        z.object({
          authorization: z.string(),
        })
      );
      if (!validHeaders) {
        return;
      }

      if (validHeaders && !validHeaders.authorization.startsWith("Bearer ")) {
        fastify.log.info("Invalid authorization header");
        return reply.badRequest(
          "Invalid authorization header. Please check your credentials and try again."
        );
      }
      const token = validHeaders.authorization.substring(7);

      // Verify the token with Clerk
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      if (!payload) {
        fastify.log.info("Invalid token");
        return reply.badRequest(
          "Invalid token. Please check your credentials and try again."
        );
      }

      // Get or create user in your database
      const user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
      });
      if (!user) {
        fastify.log.info("User not found");
        return reply.notFound(
          "Authentication failed for this user request. User not found. Please contact support."
        );
      }

      // Attach user to request
      request.user = {
        id: user.id,
        clerkId: user.clerkId,
      };

      // Authentication successful, continue to the route handler
      fastify.log.info(`User authenticated: ${request.user.clerkId}`);
    } catch (error) {
      fastify.log.error(error);
      reply.internalServerError(
        "Authentication failed due to an internal error."
      );
      return;
    }
  });

  fastify.log.info("User authentication plugin loaded for /v1 routes");
};

export default userAuthPlugin;
