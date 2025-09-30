import { isAfter, isBefore } from "date-fns";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../../helpers/prisma";
import { validateRequest } from "../../helpers/validator";
import { requireAuth } from "../../helpers/auth";

const candleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/candle/:symbol", async (request, reply) => {
    try {
      // authenticate user
      const authenticatedRequest = await requireAuth(request, reply);
      if (!authenticatedRequest) {
        return;
      }

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        z.object({
          symbol: z.string(),
        })
      );
      const validatedQuery = validateRequest(
        request.query,
        reply,
        z.object({
          scheduleId: z.string(), // uses bot schedule id
          timestamp: z.string(),
          botId: z.string(),
        })
      );
      if (!validatedParams || !validatedQuery) {
        return;
      }

      // validate scheduleId
      const schedule = await prisma.botSchedule.findUnique({
        where: {
          id: validatedQuery.scheduleId,
          bot: {
            id: validatedQuery.botId,
          },
          schedule: {
            shortlist: {
              instruments: {
                some: {
                  groww_symbol: validatedParams.symbol,
                },
              },
            },
          },
        },
        include: {
          schedule: {
            include: {
              shortlist: {
                include: {
                  instruments: true,
                },
              },
            },
          },
        },
      });
      if (!schedule) {
        return reply.badRequest(
          "Please ensure the company is part of a valid schedule that is assigned to this bot."
        );
      }

      // validate timestamp
      const timestamp = new Date(validatedQuery.timestamp);
      const startTime = new Date(schedule.schedule.tradeBegin);
      const endTime = new Date(schedule.schedule.tradeEnd);
      if (isBefore(timestamp, startTime) || isAfter(timestamp, endTime)) {
        return reply.badRequest(
          "Please ensure the timestamp is between the trade begin and end time of the schedule."
        );
      }

      // return
      return reply.send({
        message: "Hello from candle route!",
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default candleRoutes;
