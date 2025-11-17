import axios, { AxiosResponse } from "axios";
import dayjs from "dayjs";

const getGrowwAccessToken = async () => {
  try {
    const response = await axios.get(
      "https://groww-access-token-generator.onrender.com",
      {
        data: {
          api_key: process.env.GROWW_API_KEY,
          api_secret: process.env.GROWW_API_SECRET,
        },
      }
    );
    return response.data?.access_token || null;
  } catch (e) {
    return null;
  }
};

const getHistoricalCandles = async ({
  timestamp,
  symbol,
  intervalInMinutes = 5,
}: {
  symbol: string;
  timestamp: string;
  intervalInMinutes?: number;
}) => {
  try {
    const accessToken = await getGrowwAccessToken();
    if (!accessToken) {
      return null;
    }

    const response = (await axios.get(
      `https://api.groww.in/v1/historical/candle/range`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          exchange: "NSE",
          segment: "CASH",
          trading_symbol: symbol,
          start_time: timestamp,
          end_time: dayjs(timestamp).add(1, "minute").toISOString(),
          interval_in_minutes: intervalInMinutes,
        },
      }
    )) as AxiosResponse<{
      status: string;
      payload: {
        candles: [[number, number, number, number, number, number]];
        start_time: string;
        end_time: string;
        interval_in_minutes: number;
      };
    }>;

    if (response.data.status === "SUCCESS") {
      return response.data.payload.candles[0];
    }

    return null;
  } catch (e) {
    return null;
  }
};

export const groww = {
  getHistoricalCandles,
};
