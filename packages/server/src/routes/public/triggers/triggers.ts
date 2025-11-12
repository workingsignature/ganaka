import axios, { AxiosResponse } from "axios";
import { FastifyPluginAsync } from "fastify";
import * as csv from "fast-csv";
import { prisma } from "../../../helpers/prisma";
import { sendResponse } from "../../../helpers/sendResponse";
import { public_triggers_schemas } from "@ganaka/server-schemas";
import z from "zod";
import { chunk, uniqWith } from "lodash";

export interface NSEStockQuoteResponse {
  info: {
    symbol: string;
    companyName: string;
    industry: string;
    activeSeries: string[];
    debtSeries: string[];
    isFNOSec: boolean;
    isCASec: boolean;
    isSLBSec: boolean;
    isDebtSec: boolean;
    isSuspended: boolean;
    tempSuspendedSeries: string[];
    isETFSec: boolean;
    isDelisted: boolean;
    isin: string;
    listingDate: string;
    isMunicipalBond: boolean;
    isHybridSymbol: boolean;
    isTop10: boolean;
    identifier: string;
  };
  metadata: {
    series: string;
    symbol: string;
    isin: string;
    status: string;
    listingDate: string;
    industry: string;
    lastUpdateTime: string;
    pdSectorPe: number;
    pdSymbolPe: number;
    pdSectorInd: string;
    pdSectorIndAll: string;
  };
  securityInfo: {
    boardStatus: string;
    tradingStatus: string;
    tradingSegment: string;
    sessionNo: string;
    slb: string;
    classOfShare: string;
    derivatives: string;
    surveillance: {
      surv: string | null;
      desc: string | null;
    };
    faceValue: number;
    issuedSize: number;
  };
  sddDetails: {
    SDDAuditor: string;
    SDDStatus: string;
  };
  currentMarketType: string;
  priceInfo: {
    lastPrice: number;
    change: number;
    pChange: number;
    previousClose: number;
    open: number;
    close: number;
    vwap: number;
    stockIndClosePrice: number;
    lowerCP: string;
    upperCP: string;
    pPriceBand: string;
    basePrice: number;
    intraDayHighLow: {
      min: number;
      max: number;
      value: number;
    };
    weekHighLow: {
      min: number;
      minDate: string;
      max: number;
      maxDate: string;
      value: number;
    };
    iNavValue: number | null;
    checkINAV: boolean;
    tickSize: number;
    ieq: string;
  };
  industryInfo: {
    macro: string;
    sector: string;
    industry: string;
    basicIndustry: string;
  };
  preOpenMarket: {
    preopen: Array<{
      price: number;
      buyQty: number;
      sellQty: number;
      iep?: boolean;
    }>;
    ato: {
      buy: number;
      sell: number;
    };
    IEP: number;
    totalTradedVolume: number;
    finalPrice: number;
    finalQuantity: number;
    lastUpdateTime: string;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    atoBuyQty: number;
    atoSellQty: number;
    Change: number;
    perChange: number;
    prevClose: number;
  };
}

interface InstrumentData {
  exchange: string;
  exchange_token: string;
  trading_symbol: string;
  groww_symbol: string;
  name: string;
  internal_trading_symbol: string;
}

interface ProcessedInstrumentData extends InstrumentData {
  broad_sector: string;
  sector: string;
  broad_industry: string;
  industry: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRateLimit(
  url: string,
  headers: Record<string, string>,
  retries = 3,
  delay = 200
): Promise<AxiosResponse<NSEStockQuoteResponse> | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sleep(delay);
      const response = await axios.get(url, { headers, timeout: 10000 });
      return response as AxiosResponse<NSEStockQuoteResponse>;
    } catch (error: any) {
      if (attempt === retries) return null;

      if (error.response?.status === 429 || error.response?.status >= 500) {
        await sleep(delay * Math.pow(2, attempt));
      }
    }
  }
  return null;
}

async function processBatchWithConcurrency<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((item, idx) => processor(item, i + idx))
    );
    results.push(...batchResults);
  }

  return results;
}

const triggersRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post("/instruments", async (_, reply) => {
    try {
      const instruments = await axios.get(
        "https://growwapi-assets.groww.in/instruments/instrument.csv"
      );
      if (!instruments.data) {
        return reply.badRequest("No instruments found.");
      }

      const instrumentsArray: InstrumentData[] = [];
      const processedInstruments: ProcessedInstrumentData[] = [];

      const csvStream = csv.parseString(instruments.data);
      await new Promise((resolve, reject) => {
        csvStream.on("data", (data) => {
          // csv layout
          // exchange [0]
          // exchange_token [1]
          // trading_symbol [2]
          // groww_symbol [3]
          // name [4]
          // instrument_type [5]
          // segment [6]
          // series [7]
          // isin [8]
          // underlying_symbol [9]
          // underlying_exchange_token [10]
          // expiry_date [11]
          // strike_price [12]
          // lot_size [13]
          // tick_size [14]
          // freeze_quantity [15]
          // is_reserved [16]
          // buy_allowed [17]
          // sell_allowed [18]
          // internal_trading_symbol [19]
          // is_intraday [20]
          if (data[0] === "NSE" && data[6] === "CASH") {
            instrumentsArray.push({
              exchange: data[0],
              exchange_token: data[1],
              trading_symbol: data[2],
              groww_symbol: data[3],
              name: data[4],
              internal_trading_symbol: data[19],
            });
          }
        });
        csvStream.on("end", () => {
          resolve(true);
        });
        csvStream.on("error", (error) => {
          fastify.log.error(error);
          reject(error);
        });
      });

      // fetch sector information for each instrument with controlled concurrency
      const totalCount = instrumentsArray.length;
      const CONCURRENCY = 5;
      const DELAY_MS = 200;

      fastify.log.info(
        `Fetching sector information for ${totalCount} instruments with concurrency ${CONCURRENCY}...`
      );

      const headers = {
        "User-Agent": "PostmanRuntime/7.50.0",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      };

      await processBatchWithConcurrency(
        instrumentsArray,
        async (instrument, index) => {
          fastify.log.info(
            `Fetching sector information for instrument ${
              index + 1
            }/${totalCount} (${instrument.trading_symbol})`
          );

          const sectorInformation = await fetchWithRateLimit(
            `https://www.nseindia.com/api/quote-equity?symbol=${instrument.trading_symbol}`,
            headers,
            3,
            DELAY_MS
          );

          if (sectorInformation?.data?.industryInfo) {
            const info = sectorInformation.data.industryInfo;
            if (
              info.sector &&
              info.macro &&
              info.industry &&
              info.basicIndustry
            ) {
              processedInstruments.push({
                ...instrument,
                sector: info.sector,
                broad_sector: info.macro,
                broad_industry: info.industry,
                industry: info.basicIndustry,
              });
            }
          } else {
            fastify.log.error(
              `No industry information found for instrument ${instrument.trading_symbol} (${instrument.groww_symbol})`
            );
          }
        },
        CONCURRENCY
      );

      // ensuring no duplicate instruments
      const deDuplicatedInstruments = uniqWith(
        processedInstruments,
        (a, b) => a.groww_symbol === b.groww_symbol
      );

      // clearing existing instruments
      fastify.log.info(
        `Clearing ${await prisma.instrument.count()} instruments.`
      );
      await prisma.instrument.deleteMany({});
      await prisma.instrumentBroadSector.deleteMany({});
      await prisma.instrumentSector.deleteMany({});
      await prisma.instrumentBroadIndustry.deleteMany({});
      await prisma.instrumentIndustry.deleteMany({});

      // Phase 1: Extract unique values and create hierarchy
      const uniqueBroadSectors = [
        ...new Set(deDuplicatedInstruments.map((i) => i.broad_sector)),
      ];
      const uniqueSectors = [
        ...new Set(
          deDuplicatedInstruments.map((i) =>
            JSON.stringify({
              sector: i.sector,
              broadSector: i.broad_sector,
            })
          )
        ),
      ].map((s) => JSON.parse(s));
      const uniqueBroadIndustries = [
        ...new Set(
          deDuplicatedInstruments.map((i) =>
            JSON.stringify({
              broadIndustry: i.broad_industry,
              sector: i.sector,
            })
          )
        ),
      ].map((s) => JSON.parse(s));
      const uniqueIndustries = [
        ...new Set(
          deDuplicatedInstruments.map((i) =>
            JSON.stringify({
              industry: i.industry,
              broadIndustry: i.broad_industry,
            })
          )
        ),
      ].map((s) => JSON.parse(s));

      fastify.log.info(
        `Creating ${uniqueBroadSectors.length} broad sectors...`
      );
      await prisma.instrumentBroadSector.createMany({
        data: uniqueBroadSectors.map((name) => ({ name })),
        skipDuplicates: true,
      });

      fastify.log.info(`Creating ${uniqueSectors.length} sectors...`);
      for (const { sector, broadSector } of uniqueSectors) {
        await prisma.instrumentSector.upsert({
          where: { name: sector },
          create: {
            name: sector,
            broadSector: { connect: { name: broadSector } },
          },
          update: {},
        });
      }

      fastify.log.info(
        `Creating ${uniqueBroadIndustries.length} broad industries...`
      );
      for (const { broadIndustry, sector } of uniqueBroadIndustries) {
        await prisma.instrumentBroadIndustry.upsert({
          where: { name: broadIndustry },
          create: {
            name: broadIndustry,
            sector: { connect: { name: sector } },
          },
          update: {},
        });
      }

      fastify.log.info(`Creating ${uniqueIndustries.length} industries...`);
      for (const { industry, broadIndustry } of uniqueIndustries) {
        await prisma.instrumentIndustry.upsert({
          where: { name: industry },
          create: {
            name: industry,
            broadIndustry: { connect: { name: broadIndustry } },
          },
          update: {},
        });
      }

      fastify.log.info(
        `Inserting ${deDuplicatedInstruments.length} instruments.`
      );
      for await (const instrument of deDuplicatedInstruments) {
        try {
          await prisma.instrument.createMany({
            data: {
              exchange: instrument.exchange,
              exchangeToken: instrument.exchange_token,
              tradingSymbol: instrument.trading_symbol,
              growwSymbol: instrument.groww_symbol,
              name: instrument.name,
              internalTradingSymbol: instrument.internal_trading_symbol,
              broadIndustryName: instrument.broad_industry,
              industryName: instrument.industry,
              sectorName: instrument.sector,
              broadSectorName: instrument.broad_sector,
            },
          });
        } catch (error) {
          fastify.log.error(
            `Error inserting instrument ${instrument.trading_symbol}: ${error}`
          );
          fastify.log.error(
            "Unable to insert all instruments successfully. Clearing all inserted values."
          );
          await prisma.instrument.deleteMany({});
          await prisma.instrumentBroadSector.deleteMany({});
          await prisma.instrumentSector.deleteMany({});
          await prisma.instrumentBroadIndustry.deleteMany({});
          await prisma.instrumentIndustry.deleteMany({});

          // sending response
          return reply.internalServerError(
            "All instruments were not inserted successfully. Cleared all inserted values. Please try again."
          );
        }
      }

      // sending response
      return reply.send(
        sendResponse<
          z.infer<
            typeof public_triggers_schemas.triggerInstrumentsUpdate.response
          >
        >({
          statusCode: 200,
          message: `${deDuplicatedInstruments.length} instruments inserted successfully.`,
          data: undefined,
        })
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default triggersRoutes;
