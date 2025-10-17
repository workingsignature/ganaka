import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      clerkId: string;
    };
    developer?: {
      id: string;
    };
  }
}
