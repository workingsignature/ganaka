import { FastifyPluginAsync } from "fastify";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth", async (request, reply) => {});
};

export default authRoutes;
