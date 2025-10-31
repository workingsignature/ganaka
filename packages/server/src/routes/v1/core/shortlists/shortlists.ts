import { v1_core_shortlists_schemas } from "@ganaka/api-schemas";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ShortlistType } from "../../../../../generated/prisma";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { validateRequest } from "../../../../helpers/validator";

const shortlistsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
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
        sendResponse<
          z.infer<typeof v1_core_shortlists_schemas.getShortlists.response>
        >({
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
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.post("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_core_shortlists_schemas.createShortlist.body
      );
      if (!validatedBody) {
        return;
      }

      // check if instruments exist
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
          createdBy: {
            connect: { id: user.id },
          },
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
        sendResponse<
          z.infer<typeof v1_core_shortlists_schemas.createShortlist.response>
        >({
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
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.delete("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_shortlists_schemas.deleteShortlist.params
      );
      if (!validatedParams) {
        return;
      }

      // check if shortlist exists
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

      // delete shortlist
      await prisma.shortlist.delete({
        where: { id: validatedParams.id },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_core_shortlists_schemas.deleteShortlist.response>
        >({
          statusCode: 200,
          message: "Shortlist deleted successfully",
          data: undefined,
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.put("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_shortlists_schemas.updateShortlist.params
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_core_shortlists_schemas.updateShortlist.body
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      // check if instruments exist
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

      // update shortlist
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

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_core_shortlists_schemas.updateShortlist.response>
        >({
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
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default shortlistsRoutes;
