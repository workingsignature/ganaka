import { FastifyPluginAsync } from "fastify";
import { ShortlistType } from "../../../../generated/prisma";
import { prisma } from "../../../helpers/prisma";
import { sendResponse } from "../../../helpers/sendResponse";

const shortlistsRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/", async (_, reply) => {
    try {
      const shortlists = await prisma.shortlist.findMany({
        where: {
          type: ShortlistType.CURATED,
        },
        include: {
          instruments: true,
        },
      });

      return reply.send(
        sendResponse({
          statusCode: 200,
          message: "Shortlists fetched successfully",
          data: shortlists.map((shortlist) => {
            return {
              id: shortlist.id,
              name: shortlist.name,
            };
          }),
        })
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default shortlistsRoutes;
