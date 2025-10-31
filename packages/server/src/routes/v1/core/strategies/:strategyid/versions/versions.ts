import { FastifyPluginAsync } from "fastify";
import semver from "semver";
import { z } from "zod";
import { prisma } from "../../../../../../helpers/prisma";
import { sendResponse } from "../../../../../../helpers/sendResponse";
import { validateRequest } from "../../../../../../helpers/validator";
import { v1_core_strategies_versions_schemas } from "@ganaka/server-schemas";
import { InputJsonValue } from "../../../../../../../generated/prisma/runtime/library";

const versionsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      // get user
      const user = request.user;

      // validate request
      const validatedParams = validateRequest(
        request.params,
        reply,
        v1_core_strategies_versions_schemas.getVersions.params
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

      // get strategies
      const versions = await prisma.strategyVersion.findMany({
        where: {
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });
      if (!versions) {
        return reply.notFound(
          "Versions not found or you are not authorized to view this strategy"
        );
      }

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_schemas.getVersions.response
          >
        >({
          statusCode: 200,
          message: "Versions fetched successfully",
          data: versions.map((version) => ({
            id: version.id,
            name: version.name,
            version: version.version,
            customAttributes: version.customAttributes,
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
        v1_core_strategies_versions_schemas.getVersion.params
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

      // get version
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.id,
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

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_schemas.getVersion.response
          >
        >({
          statusCode: 200,
          message: "Version fetched successfully",
          data: {
            id: version.id,
            name: version.name,
            version: version.version,
            customAttributes: version.customAttributes,
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
        v1_core_strategies_versions_schemas.createVersion.params
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        z.object({
          name: z.string(),
          version: z.string().refine((version) => semver.valid(version), {
            message: "Invalid version format",
          }),
          customAttributes: z.object({}).optional().default({}),
        })
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
        include: {
          versions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });
      if (!strategy) {
        return reply.notFound(
          "Strategy not found or you are not authorized to create a version for this strategy"
        );
      }

      // check if version is incremented over the latest version
      const latestVersion = strategy.versions[0].version;
      if (latestVersion) {
        if (!semver.gt(validatedBody.version, latestVersion)) {
          return reply.badRequest(
            "Version must be greater than the latest version"
          );
        }
      }

      // create strategy
      const strategyVersion = await prisma.strategyVersion.create({
        data: {
          name: validatedBody.name,
          version: validatedBody.version,
          customAttributes: validatedBody.customAttributes,
          strategy: {
            connect: {
              id: validatedParams.strategyid,
              owner: {
                id: user.id,
              },
            },
          },
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_schemas.createVersion.response
          >
        >({
          statusCode: 200,
          message: "Version created successfully",
          data: {
            id: strategyVersion.id,
            name: strategyVersion.name,
            version: strategyVersion.version,
            customAttributes: strategyVersion.customAttributes,
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
        v1_core_strategies_versions_schemas.deleteVersion.params
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
          "Strategy not found or you are not authorized to delete versions of this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.id,
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
          "Version not found or you are not authorized to delete this version"
        );
      }

      // delete version
      await prisma.strategyVersion.delete({
        where: {
          id: validatedParams.id,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_schemas.deleteVersion.response
          >
        >({
          statusCode: 200,
          message: "Version deleted successfully",
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
        v1_core_strategies_versions_schemas.updateVersion.params
      );
      const validatedBody = validateRequest(
        request.body,
        reply,
        v1_core_strategies_versions_schemas.updateVersion.body
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
          "Strategy not found or you are not authorized to update this strategy"
        );
      }

      // check if version exists
      const version = await prisma.strategyVersion.findUnique({
        where: {
          id: validatedParams.id,
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
          "Version not found or you are not authorized to update this version"
        );
      }

      // check if version is incremented over the latest version
      if (validatedBody.version) {
        const latestVersion = version.version;
        if (!semver.gt(validatedBody.version, latestVersion)) {
          return reply.badRequest(
            "Version must be greater than the latest version"
          );
        }
      }

      // update version
      const updatedStrategyVersion = await prisma.strategyVersion.update({
        where: {
          id: validatedParams.id,
          strategy: {
            id: validatedParams.strategyid,
            owner: {
              id: user.id,
            },
          },
        },
        data: {
          name: validatedBody.name ?? version.name,
          version: validatedBody.version ?? version.version,
          customAttributes:
            (validatedBody.customAttributes as InputJsonValue) ??
            (version.customAttributes as InputJsonValue),
        },
      });

      // return
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_strategies_versions_schemas.updateVersion.response
          >
        >({
          statusCode: 200,
          message: "Version updated successfully",
          data: {
            id: updatedStrategyVersion.id,
            name: updatedStrategyVersion.name,
            version: updatedStrategyVersion.version,
            customAttributes: updatedStrategyVersion.customAttributes,
          },
        })
      );
    } catch (e) {
      fastify.log.error(e);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default versionsRoutes;
