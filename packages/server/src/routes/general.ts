import { FastifyPluginAsync } from "fastify";

export const generalRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
};
