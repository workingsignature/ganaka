import { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
};

export default healthRoutes;
