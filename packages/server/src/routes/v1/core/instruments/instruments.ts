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

      // Parse category filters from comma-separated string
      const categoryFilters: (
        | { broadSectorId: string }
        | { sectorId: string }
        | { broadIndustryId: string }
        | { industryId: string }
      )[] = [];
      if (validatedQuery.categories) {
        const categories = validatedQuery.categories
          .split(",")
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 0);

        for (const category of categories) {
          const [type, id] = category.split(":");
          if (!type || !id) continue;

          switch (type) {
            case "broad-sector":
              categoryFilters.push({ broadSectorId: id });
              break;
            case "sector":
              categoryFilters.push({ sectorId: id });
              break;
            case "broad-industry":
              categoryFilters.push({ broadIndustryId: id });
              break;
            case "industry":
              categoryFilters.push({ industryId: id });
              break;
          }
        }
      }
      // where clause
      const searchConditions = validatedQuery.query
        ? {
            OR: [
              {
                name: {
                  contains: validatedQuery.query,
                  mode: "insensitive" as const,
                },
              },
              {
                tradingSymbol: {
                  contains: validatedQuery.query,
                  mode: "insensitive" as const,
                },
              },
              {
                growwSymbol: {
                  contains: validatedQuery.query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {};
      const whereClause =
        categoryFilters.length > 0
          ? {
              AND: [searchConditions, { OR: categoryFilters }],
            }
          : searchConditions;

      // get instruments
      const instruments = await prisma.instrument.findMany({
        where: whereClause,
        skip:
          (validatedQuery.pageno ?? 1 - 1) * (validatedQuery.pagesize ?? 10),
        take: validatedQuery.pagesize ?? 25,
        orderBy: {
          name: "asc",
        },
      });

      // get total count
      const total = await prisma.instrument.count({
        where: whereClause,
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
              symbol: instrument.tradingSymbol,
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
  fastify.get("/filter-tree", async (request, reply) => {
    try {
      // Fetch all broad sectors with their sectors
      const broadSectors = await prisma.instrumentBroadSector.findMany({
        include: {
          sectors: {
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Fetch all broad industries with their industries
      const broadIndustries = await prisma.instrumentBroadIndustry.findMany({
        include: {
          industries: {
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Transform to tree structure
      const sectorsTree = broadSectors.map((broadSector) => ({
        label: broadSector.name,
        value: `broad-sector:${broadSector.id}`,
        children: broadSector.sectors.map((sector) => ({
          label: sector.name,
          value: `sector:${sector.id}`,
        })),
      }));

      const industriesTree = broadIndustries.map((broadIndustry) => ({
        label: broadIndustry.name,
        value: `broad-industry:${broadIndustry.id}`,
        children: broadIndustry.industries.map((industry) => ({
          label: industry.name,
          value: `industry:${industry.id}`,
        })),
      }));

      // send response
      return reply.send(
        sendResponse<
          z.infer<
            typeof v1_core_instruments_schemas.getInstrumentsFilterTree.response
          >
        >({
          statusCode: 200,
          message: "Filter tree fetched successfully",
          data: {
            sectors: sectorsTree,
            industries: industriesTree,
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
