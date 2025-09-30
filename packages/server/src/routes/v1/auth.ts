import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { validateRequest } from "../../helpers/validator";
import { verifyToken } from "@clerk/backend";
import z from "zod";
import { prisma } from "../../helpers/prisma";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth", async (request, reply) => {});
};

export default authRoutes;
