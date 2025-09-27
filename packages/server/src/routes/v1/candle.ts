import { FastifyPluginAsync } from "fastify";

const candleRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/candle", async (request, reply) => {
    return {
      message: "Hello from example route!",
      timestamp: new Date().toISOString(),
    };
  });
};

export default candleRoutes;
