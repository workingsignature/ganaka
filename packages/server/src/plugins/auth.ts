/// <reference path="../fastify.d.ts" />
import { verifyToken } from "@clerk/backend";
import { FastifyPluginAsync, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../helpers/prisma";
import { validateRequest } from "../helpers/validator";
import { DeveloperKeyStatus } from "../../generated/prisma";

/**
 * User Authentication Plugin
 *
 * This plugin automatically authenticates users for /v1 routes using Clerk tokens.
 * These APIs are accessed by users who are accessing the web client app.
 * These are NOT developers who are accessing the APIs through their own keys (Bots).
 */
const authPlugin =
  (type: "core" | "developer"): FastifyPluginAsync =>
  async (fastify) => {
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

        // validate authorization header
        if (validHeaders && !validHeaders.authorization.startsWith("Bearer ")) {
          fastify.log.info("Invalid authorization header");
          return reply.badRequest(
            "Invalid authorization header. Please check your credentials and try again."
          );
        }
        const token = validHeaders.authorization.substring(7);

        // authenticate user or developer
        switch (type) {
          case "core": {
            // Verify the token with Clerk
            let jwtPayload: Awaited<ReturnType<typeof verifyToken>>;
            try {
              jwtPayload = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY!,
              });
            } catch (error) {
              fastify.log.info("Invalid JWT token");
              return reply.badRequest(
                "Invalid JWT token. Please check your credentials and try again."
              );
            }

            if (!jwtPayload) {
              fastify.log.info("Invalid token");
              return reply.badRequest(
                "Invalid token. Please check your credentials and try again."
              );
            }

            // Get or create user in your database
            const user = await prisma.user.findUnique({
              where: { clerkId: jwtPayload.sub },
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
            break;
          }
          case "developer": {
            const developerKey = await prisma.developerKeys.findUnique({
              where: {
                key: token,
              },
              include: {
                user: true,
              },
            });
            if (
              !developerKey ||
              developerKey.status !== DeveloperKeyStatus.ACTIVE
            ) {
              fastify.log.info("Developer not found or inactive");
              return reply.unauthorized(
                "Authorization failed for this developer request. Please check your credentials and try again."
              );
            }

            // Attach developer to request
            request.user = {
              id: developerKey.id,
              clerkId: developerKey.user.clerkId,
            };

            // Authentication successful, continue to the route handler
            fastify.log.info(
              `Developer authenticated: ${request.user.clerkId}`
            );
            break;
          }
        }

        if (!request.user || !request.user.clerkId) {
          return reply.unauthorized("Unable to authenticate user or developer");
        }
      } catch (error) {
        fastify.log.error(error);
        return reply.internalServerError(
          "Authentication failed due to an internal error."
        );
      }
    });

    fastify.log.info("User authentication plugin loaded for /v1 routes");
  };

export default authPlugin;
