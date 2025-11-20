import { v1_developer_runs_schemas } from "@ganaka/server-schemas";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Prisma } from "../../../../../generated/prisma";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { validateRequest } from "../../../../helpers/validator";

const runsRoutes: FastifyPluginAsync = async (fastify) => {
  // ==================== GET /runs ====================
  fastify.get("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedQuery = validateRequest(
        request.query,
        reply,
        v1_developer_runs_schemas.getRuns.query,
        "query"
      );
      if (!validatedQuery) {
        return;
      }

      const query = validatedQuery as z.infer<
        typeof v1_developer_runs_schemas.getRuns.query
      >;

      // get runs - filter by status if provided, default to PENDING
      const status = query.status ?? "PENDING";
      const runs = await prisma.run.findMany({
        where: {
          status,
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

  // ==================== PUT /runs/:id ====================
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
      const existingRun = await prisma.run.findFirst({
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
      const run = await prisma.run.update({
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

  // ==================== PUT /runs/:id/executions/:executionId ====================
  // More specific route must come first to avoid routing conflicts
  fastify.put("/:id/executions/:executionId", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_schemas.updateExecution.params,
        "params"
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_developer_runs_schemas.updateExecution.body,
        "body"
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_schemas.updateExecution.params
      >;
      const body = validatedBody as z.infer<
        typeof v1_developer_runs_schemas.updateExecution.body
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
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
          "Run not found or you are not authorized to update executions for this run"
        );
      }

      // check if execution exists and belongs to run
      const existingExecution = await prisma.runExecution.findFirst({
        where: {
          id: params.executionId,
          runId: params.id,
        },
      });
      if (!existingExecution) {
        return reply.notFound(
          "Execution not found or does not belong to this run"
        );
      }

      // update execution
      const execution = await prisma.runExecution.update({
        where: { id: params.executionId },
        data: {
          status: body.status ?? existingExecution.status,
          executedAt:
            body.executedAt !== undefined
              ? body.executedAt
                ? new Date(body.executedAt)
                : null
              : existingExecution.executedAt,
          errorLog:
            body.errorLog !== undefined
              ? body.errorLog
              : existingExecution.errorLog,
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_schemas.updateExecution.response>
        >({
          statusCode: 200,
          message: "Execution updated successfully",
          data: {
            id: execution.id,
            runId: execution.runId,
            executionTime: execution.executionTime.toISOString(),
            status: execution.status,
            executedAt: execution.executedAt?.toISOString() ?? null,
            errorLog: execution.errorLog,
            timeslot: execution.timeslot as Record<string, unknown> | null,
            day: execution.day,
            createdAt: execution.createdAt.toISOString(),
            updatedAt: execution.updatedAt.toISOString(),
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });

  // ==================== GET /runs/:id/executions ====================
  fastify.get("/:id/executions", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_schemas.getExecutions.params,
        "params"
      );
      const validatedQuery = validateRequest(
        request.query,
        reply,
        v1_developer_runs_schemas.getExecutions.query,
        "query"
      );
      if (!validatedParams || !validatedQuery) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_schemas.getExecutions.params
      >;
      const query = validatedQuery as z.infer<
        typeof v1_developer_runs_schemas.getExecutions.query
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
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
          "Run not found or you are not authorized to view executions for this run"
        );
      }

      // Build where clause based on query params
      const where: {
        runId: string;
        status?: "PENDING" | "COMPLETED" | "FAILED" | "SKIPPED";
        executionTime?: { gte: Date };
      } = {
        runId: params.id,
      };

      if (query.incomplete) {
        // For incomplete: PENDING status, within last hour or future
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        where.status = "PENDING";
        where.executionTime = { gte: oneHourAgo };
      } else if (query.status) {
        // Filter by specific status
        where.status = query.status as
          | "PENDING"
          | "COMPLETED"
          | "FAILED"
          | "SKIPPED";
      }

      // get executions
      const executions = await prisma.runExecution.findMany({
        where,
        orderBy: {
          executionTime: "asc",
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_schemas.getExecutions.response>
        >({
          statusCode: 200,
          message: "Executions fetched successfully",
          data: executions.map((exec) => ({
            id: exec.id,
            runId: exec.runId,
            executionTime: exec.executionTime.toISOString(),
            status: exec.status,
            executedAt: exec.executedAt?.toISOString() ?? null,
            errorLog: exec.errorLog,
            timeslot: exec.timeslot as Record<string, unknown> | null,
            day: exec.day,
            createdAt: exec.createdAt.toISOString(),
            updatedAt: exec.updatedAt.toISOString(),
          })),
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });

  // ==================== POST /runs/:id/executions ====================
  fastify.post("/:id/executions", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_developer_runs_schemas.createExecutions.params,
        "params"
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_developer_runs_schemas.createExecutions.body,
        "body"
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      const params = validatedParams as z.infer<
        typeof v1_developer_runs_schemas.createExecutions.params
      >;
      const body = validatedBody as z.infer<
        typeof v1_developer_runs_schemas.createExecutions.body
      >;

      // check if run exists and belongs to user
      const existingRun = await prisma.run.findFirst({
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
          "Run not found or you are not authorized to create executions for this run"
        );
      }

      // create execution records in transaction
      const executions = await prisma.$transaction(
        body.executions.map((exec) =>
          prisma.runExecution.create({
            data: {
              runId: params.id,
              executionTime: new Date(exec.executionTime),
              status: "PENDING",
              timeslot: exec.timeslot
                ? (exec.timeslot as Prisma.InputJsonValue)
                : Prisma.JsonNull,
              day: exec.day ?? null,
            },
          })
        )
      );

      // return
      return reply.send(
        sendResponse<
          z.infer<typeof v1_developer_runs_schemas.createExecutions.response>
        >({
          statusCode: 200,
          message: "Executions created successfully",
          data: executions.map((exec) => ({
            id: exec.id,
            runId: exec.runId,
            executionTime: exec.executionTime.toISOString(),
            status: exec.status,
            executedAt: exec.executedAt?.toISOString() ?? null,
            errorLog: exec.errorLog,
            timeslot: exec.timeslot as Record<string, unknown> | null,
            day: exec.day,
            createdAt: exec.createdAt.toISOString(),
            updatedAt: exec.updatedAt.toISOString(),
          })),
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default runsRoutes;
