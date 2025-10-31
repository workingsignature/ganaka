import { FastifyPluginAsync } from "fastify";
import { verifyWebhook } from "@clerk/fastify/webhooks";
import { prisma } from "../../../helpers/prisma";
import z from "zod";
import { public_webhooks_schemas } from "@ganaka/api-schemas";
import { sendResponse } from "../../../helpers/sendResponse";

/**
 * Webhook route triggered by Clerk when user is created or updated or deleted.
 * Used to sync user data to our database.
 */
const webhooksRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post("/user", async (request, reply) => {
    try {
      const evt = await verifyWebhook(request);

      switch (evt.type) {
        case "user.created": {
          await prisma.user.create({
            data: {
              clerkId: evt.data.id,
              email: evt.data?.email_addresses?.[0]?.email_address,
              firstName: evt.data?.first_name ?? "Unknown",
              lastName: evt.data?.last_name ?? "Unknown",
            },
          });
          fastify.log.info(`User created: ${evt.data.id}`);
          return sendResponse<
            z.infer<typeof public_webhooks_schemas.clerkUserWebhook.response>
          >({
            statusCode: 200,
            message: "User created",
            data: {
              message: "User created",
            },
          });
        }
        case "user.updated": {
          const user = await prisma.user.findUnique({
            where: { clerkId: evt.data.id },
          });
          if (!user) {
            fastify.log.info(`User not found for update: ${evt.data.id}`);
            return reply.notFound("User not found");
          }
          await prisma.user.update({
            where: { clerkId: evt.data.id },
            data: {
              email: evt.data?.email_addresses?.[0]?.email_address,
              firstName: evt.data?.first_name ?? "Unknown",
              lastName: evt.data?.last_name ?? "Unknown",
            },
          });
          fastify.log.info(`User updated: ${evt.data.id}`);
          return sendResponse<
            z.infer<typeof public_webhooks_schemas.clerkUserWebhook.response>
          >({
            statusCode: 200,
            message: "User updated",
            data: {
              message: "User updated",
            },
          });
        }
        case "user.deleted": {
          const user = await prisma.user.findUnique({
            where: { clerkId: evt.data.id },
          });
          if (!user) {
            fastify.log.info(`User not found for delete: ${evt.data.id}`);
            return reply.notFound("User not found");
          }
          await prisma.user.delete({
            where: { clerkId: evt.data.id },
          });
          fastify.log.info(`User deleted: ${evt.data.id}`);
          return reply.send(
            sendResponse<
              z.infer<typeof public_webhooks_schemas.clerkUserWebhook.response>
            >({
              statusCode: 200,
              message: "User deleted",
              data: { message: "User deleted" },
            })
          );
        }
        default: {
          fastify.log.info(`Invalid event type: ${evt.type}`);
          return reply.badRequest("Invalid event type");
        }
      }
    } catch (err) {
      fastify.log.error("Error verifying webhook:");
      fastify.log.error(err);
      return reply.badRequest("Error verifying webhook");
    }
  });
};

export default webhooksRoutes;
