import { FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify";
import { validateRequest } from "./validator";
import z from "zod";
import { prisma } from "../helpers/prisma";
import { verifyToken } from "@clerk/backend";

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    clerkId: string;
  };
}

interface AuthenticatedDeveloperRequest extends FastifyRequest {
  developer: {
    id: string;
  };
}

/**
 * Authenticates user of the platform using Clerk authentication.
 * These are users who are accessing the APIs through the web client app.
 * These are NOT developers who are accessing the APIs through their own keys (Bots).
 */
const authenticatedClientUser = async (
  callback: (
    request: AuthenticatedRequest,
    reply: FastifyReply
  ) => Promise<undefined>
): Promise<RouteHandlerMethod> => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
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
        return null;
      }

      if (validHeaders && !validHeaders.authorization.startsWith("Bearer ")) {
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
        return reply.badRequest(
          "Invalid token. Please check your credentials and try again."
        );
      }

      // Get or create user in your database
      let user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
      });
      if (!user) {
        // Create user if they don't exist
        user = await prisma.user.create({
          data: {
            clerkId: payload.sub,
          },
        });
      }

      // Attach user to request
      (request as AuthenticatedRequest).user = {
        id: user.id,
        clerkId: user.clerkId,
      };

      return callback(request as AuthenticatedRequest, reply);
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  };
};

export const requestWrapper = {
  authenticatedClientUser,
};
