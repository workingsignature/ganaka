import { FastifyPluginAsync } from "fastify";
import { sendResponse } from "../../helpers/sendResponse";
import z from "zod";
import { public_health_schemas } from "@ganaka/server-schemas";

const healthRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Health check
  fastify.get("/health", async () => {
    return sendResponse<
      z.infer<typeof public_health_schemas.getHealth.response>
    >({
      statusCode: 200,
      message: "Health check",
      data: { status: "ok", timestamp: new Date().toISOString() },
    });
  });
};

export default healthRoutes;
