import axios from "axios";
import { FastifyPluginAsync } from "fastify";
import * as csv from "fast-csv";
import { prisma } from "../../../helpers/prisma";

const updateInstrumentsRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/triggers/instruments", async (request, reply) => {
    try {
      const instruments = await axios.get(
        "https://growwapi-assets.groww.in/instruments/instrument.csv"
      );
      if (!instruments.data) {
        return reply.badRequest("No instruments found.");
      }

      const instrumentsArray: {
        exchange: string;
        exchange_token: string;
        trading_symbol: string;
        groww_symbol: string;
        name: string;
        internal_trading_symbol: string;
      }[] = [];

      const csvStream = csv.parseString(instruments.data);
      await new Promise((resolve, reject) => {
        csvStream.on("data", (data) => {
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

      await prisma.$transaction(
        instrumentsArray.map((instrument) => {
          return prisma.instrument.upsert({
            where: {
              groww_symbol: instrument.groww_symbol,
            },
            create: instrument,
            update: instrument,
          });
        })
      );

      return {
        message: `${instrumentsArray.length} instruments inserted successfully.`,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError("An unexpected error occurred.");
    }
  });
};

export default updateInstrumentsRoutes;
