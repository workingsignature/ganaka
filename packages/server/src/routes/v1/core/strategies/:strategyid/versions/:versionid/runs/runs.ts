import { v1_core_strategies_versions_runs_schemas } from "@ganaka/server-schemas";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { InputJsonValue } from "../../../../../../../../../generated/prisma/runtime/library";
import { ShortlistType } from "../../../../../../../../../generated/prisma";
import { prisma } from "../../../../../../../../helpers/prisma";
import { sendResponse } from "../../../../../../../../helpers/sendResponse";
import { validateRequest } from "../../../../../../../../helpers/validator";

// Helper function to extract all shortlist IDs from a schedule
function extractShortlistIds(
  schedule: z.infer<
    typeof v1_core_strategies_versions_runs_schemas.scheduleInputSchema
  >
): string[] {
  const shortlistIds: string[] = [];
  const days = [
    schedule.daywise.monday,
    schedule.daywise.tuesday,
    schedule.daywise.wednesday,
    schedule.daywise.thursday,
    schedule.daywise.friday,
  ];

  for (const day of days) {
    if (day.shortlist && Array.isArray(day.shortlist)) {
      shortlistIds.push(...day.shortlist);
    }
  }

  return [...new Set(shortlistIds)]; // Remove duplicates
}

// Helper function to validate shortlist IDs
async function validateShortlistIds(
  shortlistIds: string[],
  userId: string
): Promise<{ valid: boolean; missingIds: string[] }> {
  if (shortlistIds.length === 0) {
    return { valid: true, missingIds: [] };
  }

  // Find all shortlists that exist and are accessible (CURATED or USER owned by the user)
  const shortlists = await prisma.shortlist.findMany({
    where: {
      id: {
        in: shortlistIds,
      },
      OR: [
        { type: ShortlistType.CURATED },
        {
          type: ShortlistType.USER,
          createdById: userId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  const foundIds = new Set(shortlists.map((s) => s.id));
  const missingIds = shortlistIds.filter((id) => !foundIds.has(id));

  return {
    valid: missingIds.length === 0,
    missingIds,
  };
}

const runsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_strategies_versions_runs_schemas.getRuns.params,
        "params"
      );
      if (!validatedParams) {
        return;
      }

      // check if strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.strategyid,
          owner: {
            id: user.id,
          },
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to view this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.versionid,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });
      if (!version) {
        return reply.notFound(
          "Version not found or you are not authorized to view this version"
        );
      }

      // get runs
      const runs = await prisma.strategyVersionRun.findMany({
        where: {
          versionId: validatedParams.versionid,
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_runs_schemas.getRuns.response
          >
        >({
          statusCode: 200,
          message: "Runs fetched successfully",
          data: runs.map((run) => ({
            id: run.id,
            schedule: run.schedule as z.infer<
              typeof v1_core_strategies_versions_runs_schemas.scheduleSchema
            >,
            currentBalance: run.currentBalance,
            startingBalance: run.startingBalance,
            endingBalance: run.endingBalance,
            runType: run.runType,
            errorLog: run.errorLog,
            customAttributes: run.customAttributes as Record<string, unknown>,
            status: run.status,
            createdAt: run.createdAt.toISOString(),
            updatedAt: run.updatedAt.toISOString(),
          })),
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
  // ---------------------------------------------------------------
  fastify.get("/:id", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_strategies_versions_runs_schemas.getRun.params,
        "params"
      );
      if (!validatedParams) {
        return;
      }

      // check if strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.strategyid,
          owner: {
            id: user.id,
          },
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to view this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.versionid,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });
      if (!version) {
        return reply.notFound(
          "Version not found or you are not authorized to view this version"
        );
      }

      // get run
      const run = await prisma.strategyVersionRun.findFirst({
        where: {
          id: validatedParams.id,
          versionId: validatedParams.versionid,
        },
      });
      if (!run) {
        return reply.notFound(
          "Run not found or you are not authorized to view this run"
        );
      }

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_runs_schemas.getRun.response
          >
        >({
          statusCode: 200,
          message: "Run fetched successfully",
          data: {
            id: run.id,
            schedule: run.schedule as z.infer<
              typeof v1_core_strategies_versions_runs_schemas.scheduleSchema
            >,
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
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_strategies_versions_runs_schemas.createRun.params,
        "params"
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_core_strategies_versions_runs_schemas.createRun.body,
        "body"
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      // check if strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.strategyid,
          owner: {
            id: user.id,
          },
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to view this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.versionid,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });
      if (!version) {
        return reply.notFound(
          "Version not found or you are not authorized to view this version"
        );
      }

      // validate shortlist IDs
      const shortlistIds = extractShortlistIds(validatedBody.schedule);
      const shortlistValidation = await validateShortlistIds(
        shortlistIds,
        user.id
      );
      if (!shortlistValidation.valid) {
        return reply.badRequest(
          `The following shortlist IDs do not exist or you are not authorized to access them: ${shortlistValidation.missingIds.join(
            ", "
          )}`
        );
      }

      // create run
      const run = await prisma.strategyVersionRun.create({
        data: {
          schedule: validatedBody.schedule as InputJsonValue,
          currentBalance: validatedBody.currentBalance,
          startingBalance: validatedBody.startingBalance,
          endingBalance: validatedBody.endingBalance,
          runType: validatedBody.runType,
          errorLog: validatedBody.errorLog ?? null,
          customAttributes:
            (validatedBody.customAttributes as InputJsonValue) ?? {},
          status: validatedBody.status ?? "PENDING",
          version: {
            connect: { id: validatedParams.versionid },
          },
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_runs_schemas.createRun.response
          >
        >({
          statusCode: 200,
          message: "Run created successfully",
          data: {
            id: run.id,
            schedule: run.schedule as z.infer<
              typeof v1_core_strategies_versions_runs_schemas.scheduleSchema
            >,
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
        v1_core_strategies_versions_runs_schemas.deleteRun.params,
        "params"
      );
      if (!validatedParams) {
        return;
      }

      // check if strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.strategyid,
          owner: {
            id: user.id,
          },
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to view this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.versionid,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });
      if (!version) {
        return reply.notFound(
          "Version not found or you are not authorized to view this version"
        );
      }

      // check if run exists
      const run = await prisma.strategyVersionRun.findFirst({
        where: {
          id: validatedParams.id,
          versionId: validatedParams.versionid,
        },
      });
      if (!run) {
        return reply.notFound(
          "Run not found or you are not authorized to delete this run"
        );
      }

      // delete run
      await prisma.strategyVersionRun.delete({
        where: { id: validatedParams.id },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_runs_schemas.deleteRun.response
          >
        >({
          statusCode: 200,
          message: "Run deleted successfully",
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
        v1_core_strategies_versions_runs_schemas.updateRun.params,
        "params"
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_core_strategies_versions_runs_schemas.updateRun.body,
        "body"
      );
      if (!validatedParams || !validatedBody) {
        return;
      }

      // check if strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: {
          id: validatedParams.strategyid,
          owner: {
            id: user.id,
          },
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to view this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.versionid,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });
      if (!version) {
        return reply.notFound(
          "Version not found or you are not authorized to view this version"
        );
      }

      // check if run exists
      const existingRun = await prisma.strategyVersionRun.findFirst({
        where: {
          id: validatedParams.id,
          versionId: validatedParams.versionid,
        },
      });
      if (!existingRun) {
        return reply.notFound(
          "Run not found or you are not authorized to update this run"
        );
      }

      // validate shortlist IDs if schedule is being updated
      if (validatedBody.schedule !== undefined) {
        const shortlistIds = extractShortlistIds(validatedBody.schedule);
        const shortlistValidation = await validateShortlistIds(
          shortlistIds,
          user.id
        );
        if (!shortlistValidation.valid) {
          return reply.badRequest(
            `The following shortlist IDs do not exist or you are not authorized to access them: ${shortlistValidation.missingIds.join(
              ", "
            )}`
          );
        }
      }

      // update run
      const run = await prisma.strategyVersionRun.update({
        where: { id: validatedParams.id },
        data: {
          schedule:
            validatedBody.schedule !== undefined
              ? (validatedBody.schedule as InputJsonValue)
              : (existingRun.schedule as InputJsonValue),
          currentBalance:
            validatedBody.currentBalance ?? existingRun.currentBalance,
          startingBalance:
            validatedBody.startingBalance ?? existingRun.startingBalance,
          endingBalance:
            validatedBody.endingBalance ?? existingRun.endingBalance,
          runType: validatedBody.runType ?? existingRun.runType,
          errorLog:
            validatedBody.errorLog !== undefined
              ? validatedBody.errorLog
              : existingRun.errorLog,
          customAttributes:
            validatedBody.customAttributes !== undefined
              ? (validatedBody.customAttributes as InputJsonValue)
              : (existingRun.customAttributes as InputJsonValue),
          status: validatedBody.status ?? existingRun.status,
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_runs_schemas.updateRun.response
          >
        >({
          statusCode: 200,
          message: "Run updated successfully",
          data: {
            id: run.id,
            schedule: run.schedule as z.infer<
              typeof v1_core_strategies_versions_runs_schemas.scheduleSchema
            >,
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
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default runsRoutes;
