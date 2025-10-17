import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requestWrapper } from "../../../helpers/requestWrapper";
import { validateRequest } from "../../../helpers/validator";

const candleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/candle/:symbol",
    await requestWrapper.authenticatedClientUser(async (request, reply) => {
      try {
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

        // validate timestamp
        const timestamp = new Date(validatedQuery.timestamp);
        // const startTime = new Date(schedule.schedule.tradeBegin);
        // const endTime = new Date(schedule.schedule.tradeEnd);
        // if (isBefore(timestamp, startTime) || isAfter(timestamp, endTime)) {
        //   return reply.badRequest(
        //     "Please ensure the timestamp is between the trade begin and end time of the schedule."
        //   );
        // }

        // return
        return reply.send({
          message: "Hello from candle route!",
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return reply.internalServerError("An unexpected error occurred.");
      }
    })
  );
};

export default candleRoutes;
