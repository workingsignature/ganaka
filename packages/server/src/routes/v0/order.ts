import { FastifyPluginAsync } from "fastify";

const orderRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post("/order", async (request, reply) => {
    return {
      message: "Hello from example route!",
      timestamp: new Date().toISOString(),
    };
  });
};

export default orderRoutes;
