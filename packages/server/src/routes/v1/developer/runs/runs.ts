import { v1_developer_runs_schemas } from "@ganaka/server-schemas";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";

const runsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // get runs
      const runs = await prisma.strategyVersionRun.findMany({
        where: {
          version: {
            strategy: {
              owner: {
                id: user.id,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_schemas.getRuns.response>
        >({
          statusCode: 200,
          message: "Runs fetched successfully",
          data: runs.map((run) => {
            return {
              id: run.id,
              schedule: run.schedule as z.infer<
                typeof v1_developer_runs_schemas.getRuns.response
              >["data"][0]["schedule"],
              currentBalance: run.currentBalance,
              startingBalance: run.startingBalance,
              endingBalance: run.endingBalance,
              runType: run.runType,
              errorLog: run.errorLog,
              customAttributes: run.customAttributes as Record<string, unknown>,
              status: run.status,
              createdAt: run.createdAt.toISOString(),
              updatedAt: run.updatedAt.toISOString(),
            };
          }),
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default runsRoutes;
