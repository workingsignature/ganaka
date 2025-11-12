import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../../helpers/prisma";
import { sendResponse } from "../../../../helpers/sendResponse";
import { v1_core_instruments_schemas } from "@ganaka/server-schemas";
import z from "zod";
import { validateRequest } from "../../../../helpers/validator";
import { Prisma } from "../../../../../generated/prisma";
import { lowerCase, startCase } from "lodash";

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
      const categoryFilters: Prisma.InstrumentWhereInput[] = [];
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
              categoryFilters.push({ broadSector: { id } });
              break;
            case "sector":
              categoryFilters.push({ sector: { id } });
              break;
            case "broad-industry":
              categoryFilters.push({ broadIndustry: { id } });
              break;
            case "industry":
              categoryFilters.push({ industry: { id } });
              break;
          }
        }
      }
      // where clause
      const searchConditions: Prisma.InstrumentWhereInput = validatedQuery.query
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
      const whereClause: Prisma.InstrumentWhereInput =
        categoryFilters.length > 0
          ? {
              AND: [searchConditions, { OR: categoryFilters }],
            }
          : searchConditions;

      // get instruments
      const instruments = await prisma.instrument.findMany({
        where: whereClause,
        skip:
          ((validatedQuery.pageno ?? 1) - 1) * (validatedQuery.pagesize ?? 25),
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
  fastify.get("/filter-tree", async (_, reply) => {
    try {
      // Fetch all broad sectors with their nested relationships
      const broadSectors = await prisma.instrumentBroadSector.findMany({
        include: {
          sectors: {
            include: {
              broadIndustries: {
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
              },
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Transform to combined tree structure: BroadSector → Sector → BroadIndustry → Industry
      const tree = broadSectors.map((broadSector) => ({
        label: startCase(lowerCase(broadSector.name)),
        value: `broad-sector:${broadSector.id}`,
        children: broadSector.sectors.map((sector) => ({
          label: startCase(lowerCase(sector.name)),
          value: `sector:${sector.id}`,
          children: sector.broadIndustries.map((broadIndustry) => ({
            label: startCase(lowerCase(broadIndustry.name)),
            value: `broad-industry:${broadIndustry.id}`,
            children: broadIndustry.industries.map((industry) => ({
              label: startCase(lowerCase(industry.name)),
              value: `industry:${industry.id}`,
            })),
          })),
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
            tree,
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
