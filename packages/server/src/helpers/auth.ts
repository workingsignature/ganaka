import { validateRequest } from "../helpers/validator";
import { verifyToken } from "@clerk/backend";
import z from "zod";
import { prisma } from "../helpers/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    clerkId: string;
  };
}

const authenticateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthenticatedRequest | null> => {
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

  if (!validHeaders || !validHeaders.authorization.startsWith("Bearer ")) {
    reply.badRequest("Missing or invalid authorization header");
    return null;
  }
  const token = validHeaders.authorization.substring(7);
  // Verify the token with Clerk
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY!,
  });
  if (!payload) {
    return reply.badRequest("Invalid token");
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

  return request as AuthenticatedRequest;
};

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authenticatedRequest = await authenticateUser(request, reply);
  if (!authenticatedRequest) {
    return;
  }
  return authenticatedRequest;
}
