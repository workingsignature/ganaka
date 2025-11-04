import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { v1_core_instruments_schemas } from "@ganaka/server-schemas";
import z from "zod";
import { validateRequest } from "../../../../helpers/validator";

const instrumentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // validate request
      const validatedQuery = validateRequest(
        request.query,
        reply,
        v1_core_instruments_schemas.getInstruments.query
      );
      if (!validatedQuery) {
        return;
      }

      // get instruments
      const instruments = await prisma.instrument.findMany({
        where: {
          OR: [
            {
              name: {
                contains: validatedQuery.query ?? "",
                mode: "insensitive",
              },
            },
            {
              trading_symbol: {
                contains: validatedQuery.query ?? "",
                mode: "insensitive",
              },
            },
            {
              groww_symbol: {
                contains: validatedQuery.query ?? "",
                mode: "insensitive",
              },
            },
          ],
        },
        skip:
          (validatedQuery.pageno ?? 1 - 1) * (validatedQuery.pagesize ?? 10),
        take: validatedQuery.pagesize ?? 25,
        orderBy: {
          name: "asc",
        },
      });

      // get total count
      const total = await prisma.instrument.count({
        where: {
          OR: [
            {
              name: {
                contains: validatedQuery.query ?? "",
                mode: "insensitive",
              },
            },
            {
              groww_symbol: {
                contains: validatedQuery.query ?? "",
                mode: "insensitive",
              },
            },
            {
              trading_symbol: {
                contains: validatedQuery.query ?? "",
                mode: "insensitive",
              },
            },
          ],
        },
      });

      // send response
      return reply.send(
        sendResponse<
          z.infer<typeof v1_core_instruments_schemas.getInstruments.response>
        >({
          statusCode: 200,
          message: "Instruments fetched successfully",
          data: {
            instruments: instruments.map((instrument) => ({
              id: instrument.id,
              name: instrument.name,
              symbol: instrument.trading_symbol,
              exchange: instrument.exchange,
            })),
            paginationInfo: {
              count: total,
              pageno: validatedQuery.pageno ?? 1,
              pagesize: validatedQuery.pagesize ?? 25,
            },
          },
        })
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default instrumentsRoutes;
