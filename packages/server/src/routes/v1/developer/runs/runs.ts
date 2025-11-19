import { v1_developer_runs_schemas } from "@ganaka/server-schemas";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { validateRequest } from "../../../../helpers/validator";

const runsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // get runs - only return PENDING runs
      const runs = await prisma.strategyVersionRun.findMany({
        where: {
          status: "PENDING",
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

  fastify.put("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_schemas.updateRun.params,
        "params"
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_developer_runs_schemas.updateRun.body,
        "body"
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_schemas.updateRun.params
      >;
      const body = validatedBody as z.infer<
        typeof v1_developer_runs_schemas.updateRun.body
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.strategyVersionRun.findFirst({
        where: {
          id: params.id,
          version: {
            strategy: {
              owner: {
                id: user.id,
              },
            },
          },
        },
      });
      if (!existingRun) {
        return reply.notFound(
          "Run not found or you are not authorized to update this run"
        );
      }

      // update run
      const run = await prisma.strategyVersionRun.update({
        where: { id: params.id },
        data: {
          status: body.status ?? existingRun.status,
          errorLog:
            body.errorLog !== undefined ? body.errorLog : existingRun.errorLog,
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_schemas.updateRun.response>
        >({
          statusCode: 200,
          message: "Run updated successfully",
          data: {
            id: run.id,
            schedule: existingRun.schedule as z.infer<
              typeof v1_developer_runs_schemas.updateRun.response
            >["data"]["schedule"],
            currentBalance: run.currentBalance,
            startingBalance: run.startingBalance,
            endingBalance: run.endingBalance,
            runType: run.runType,
            errorLog: run.errorLog,
            customAttributes: run.customAttributes as Record<string, unknown>,
            status: run.status,
            createdAt: run.createdAt.toISOString(),
            updatedAt: run.updatedAt.toISOString(),
          },
        })
      );
    } catch (e) {
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default runsRoutes;
