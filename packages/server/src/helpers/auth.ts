import { validateRequest } from "../helpers/validator";
import { verifyToken } from "@clerk/backend";
import z from "zod";
import { prisma } from "../helpers/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { DeveloperKeyStatus } from "../../generated/prisma";

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

  return request as AuthenticatedRequest;
};

const authenticateDeveloper = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthenticatedDeveloperRequest | null> => {
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
    return null;
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
  (request as AuthenticatedDeveloperRequest).developer = {
    id: developer.id,
  };

  return request as AuthenticatedDeveloperRequest;
};

export async function requireDeveloperAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthenticatedDeveloperRequest | null> {
  const authenticatedDeveloperRequest = await authenticateDeveloper(
    request,
    reply
  );
  if (!authenticatedDeveloperRequest) {
    return null;
  }
  return authenticatedDeveloperRequest;
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authenticatedRequest = await authenticateUser(request, reply);
  if (!authenticatedRequest) {
    return null;
  }
  return authenticatedRequest;
}
