import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../../helpers/prisma";
import { z } from "zod";
import { validateRequest } from "../../../../helpers/validator";
import {
  DeveloperKeyStatus,
  ShortlistType,
} from "../../../../../generated/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";

const shortlistsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // Authentication is handled by userAuthPlugin
      // The request now has user information attached
      const user = request.user;

      // get shortlists
      const shortlists = await prisma.shortlist.findMany({
        where: {
          createdBy: {
            id: user.id,
          },
          type: ShortlistType.USER,
        },
        include: {
          instruments: true,
        },
      });

      // return
      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Shortlists fetched successfully",
          data: shortlists.map((shortlist) => {
            return {
              id: shortlist.id,
              name: shortlist.name,
              instruments: shortlist.instruments.map((instrument) => ({
                id: instrument.id,
                name: instrument.name,
              })),
            };
          }),
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.post("/", async (request, reply) => {
    try {
      // validate request
      const validatedBody = validateRequest(
        request.body,
        reply,
        z.object({
          name: z.string(),
          instruments: z.array(z.string()),
        })
      );
      if (!validatedBody) {
        return;
      }

      const instruments = await prisma.instrument.findMany({
        where: {
          id: {
            in: validatedBody.instruments,
          },
        },
      });

      if (instruments.length !== validatedBody.instruments.length) {
        return reply.badRequest("Some instruments were not found.");
      }

      // create shortlist
      const shortlist = await prisma.shortlist.create({
        data: {
          name: validatedBody.name,
          type: ShortlistType.USER,
          instruments: {
            connect: instruments.map((instrument) => ({ id: instrument.id })),
          },
        },
        include: {
          instruments: true,
        },
      });

      // return
      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Shortlist created successfully",
          data: {
            id: shortlist.id,
            name: shortlist.name,
            instruments: shortlist.instruments.map((instrument) => ({
              id: instrument.id,
              name: instrument.name,
            })),
          },
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.delete("/:id", async (request, reply) => {
    try {
      const user = request.user;

      const validatedParams = validateRequest(
        request.params,
        reply,
        z.object({
          id: z.string(),
        })
      );
      if (!validatedParams) {
        return;
      }

      const shortlist = await prisma.shortlist.findUnique({
        where: {
          id: validatedParams.id,
          createdBy: {
            id: user.id,
          },
        },
      });

      if (!shortlist) {
        return reply.notFound(
          "Shortlist not found or you are not authorized to delete this shortlist"
        );
      }

      await prisma.shortlist.delete({
        where: { id: validatedParams.id },
      });

      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Shortlist deleted successfully",
          data: undefined,
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.put("/:id", async (request, reply) => {
    try {
      const user = request.user;
      const validatedParams = validateRequest(
        request.params,
        reply,
        z.object({
          id: z.string(),
        })
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        z.object({
          name: z.string(),
          instruments: z.array(z.string()),
        })
      );

      if (!validatedParams || !validatedBody) {
        return;
      }

      const instruments = await prisma.instrument.findMany({
        where: {
          id: {
            in: validatedBody.instruments,
          },
        },
      });

      if (instruments.length !== validatedBody.instruments.length) {
        return reply.badRequest("Some instruments were not found.");
      }

      const shortlist = await prisma.shortlist.update({
        where: { id: validatedParams.id, createdBy: { id: user.id } },
        data: {
          name: validatedBody.name,
          instruments: {
            set: instruments.map((instrument) => ({ id: instrument.id })),
          },
        },
        include: {
          instruments: true,
        },
      });

      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Shortlist updated successfully",
          data: {
            id: shortlist.id,
            name: shortlist.name,
            instruments: shortlist.instruments.map((instrument) => ({
              id: instrument.id,
              name: instrument.name,
            })),
          },
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default shortlistsRoutes;
