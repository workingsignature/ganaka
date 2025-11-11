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

      // fetch sector information for each instrument
      const totalCount = instrumentsArray.length;
      let currentCount = 0;
      for await (const instrument of instrumentsArray) {
        currentCount++;
        fastify.log.info(
          `Fetching sector information for instrument ${currentCount}/${totalCount} (${instrument.trading_symbol})`
        );

        if (currentCount > 10) {
          break;
        }

        try {
          const sectorInformation = (await axios.get(
            `https://www.nseindia.com/api/quote-equity?symbol=${instrument.trading_symbol}`,
            {
              headers: {
                "User-Agent": "PostmanRuntime/7.50.0",
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive",
              },
            }
          )) as AxiosResponse<NSEStockQuoteResponse>;
          if (sectorInformation.data && sectorInformation.data.industryInfo) {
            if (
              sectorInformation.data.industryInfo.sector &&
              sectorInformation.data.industryInfo.macro &&
              sectorInformation.data.industryInfo.industry &&
              sectorInformation.data.industryInfo.basicIndustry
            ) {
              processedInstruments.push({
                ...instrument,
                sector: sectorInformation.data.industryInfo.sector,
                broad_sector: sectorInformation.data.industryInfo.macro,
                broad_industry: sectorInformation.data.industryInfo.industry,
                industry: sectorInformation.data.industryInfo.basicIndustry,
              });
            }
          } else {
            fastify.log.error(
              `No industry information found for instrument ${instrument.trading_symbol} (${instrument.groww_symbol})`
            );
          }
        } catch (error) {
          fastify.log.error(
            `Error fetching sector information for instrument ${instrument.trading_symbol}: ${error}`
          );
        }
      }

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

      // inserting new instruments
      fastify.log.info(
        `Inserting ${deDuplicatedInstruments.length} instruments.`
      );
      const insertOperations = await Promise.all(
        deDuplicatedInstruments.map(async (instrument) => {
          return await new Promise<boolean>(async (resolve, reject) => {
            try {
              await prisma.instrument.create({
                data: {
                  exchange: instrument.exchange,
                  exchangeToken: instrument.exchange_token,
                  tradingSymbol: instrument.trading_symbol,
                  growwSymbol: instrument.groww_symbol,
                  name: instrument.name,
                  internalTradingSymbol: instrument.internal_trading_symbol,
                  broadSector: {
                    connectOrCreate: {
                      where: {
                        name: instrument.broad_sector,
                      },
                      create: {
                        name: instrument.broad_sector,
                      },
                    },
                  },
                  sector: {
                    connectOrCreate: {
                      where: {
                        name: instrument.sector,
                      },
                      create: {
                        name: instrument.sector,
                        broadSector: {
                          connectOrCreate: {
                            where: {
                              name: instrument.broad_sector,
                            },
                            create: {
                              name: instrument.broad_sector,
                            },
                          },
                        },
                      },
                    },
                  },
                  broadIndustry: {
                    connectOrCreate: {
                      where: {
                        name: instrument.broad_industry,
                      },
                      create: {
                        name: instrument.broad_industry,
                      },
                    },
                  },
                  industry: {
                    connectOrCreate: {
                      where: {
                        name: instrument.industry,
                      },
                      create: {
                        name: instrument.industry,
                        broadIndustry: {
                          connectOrCreate: {
                            where: {
                              name: instrument.broad_industry,
                            },
                            create: {
                              name: instrument.broad_industry,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              });
              resolve(true);
            } catch (error) {
              fastify.log.error(
                `Error inserting instrument ${instrument.trading_symbol}: ${error}`
              );
              reject(false);
            }
          });
        })
      );

      if (insertOperations.some((operation) => operation === false)) {
        fastify.log.error(
          "All instruments were not inserted successfully. Clearing all inserted values."
        );
        await prisma.instrument.deleteMany({});
        return reply.internalServerError(
          "All instruments were not inserted successfully. Cleared all inserted values. Please try again."
        );
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
