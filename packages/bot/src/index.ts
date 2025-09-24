import dotenv from "dotenv";
import _ from "lodash";
import {
  format,
  addDays,
  startOfDay,
  addMinutes,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";

// Load environment variables
dotenv.config();

// --- Configuration constants ---
const CANDLE_MIN = 5;
const VOLUME_SURGE_X = 1.5;
const ATR_LOOKBACK = 14;
const VOL_LOOKBACK = 20;
const SCORE_THRESHOLD = 2.5; // raise to be more selective (max score ≈ 4.5)
const ACCOUNT_RISK_PER_TRADE = 0.005; // 0.5% of account equity
const FALLBACK_MIN_STOP_PCT = 0.008; // ~0.8% if ATR is tiny

// Optional: NIFTY symbol (adjust to your Groww symbol if different)
const NIFTY_GROWW_SYMBOL = "NSE-NIFTY-50";

// TypeScript interfaces
interface CandleData {
  ts: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorPack {
  ltp: number;
  vwap: number;
  atr: number;
  prev_close: number;
  today_open: number;
  opening_gap_pct: number;
  f15_high: number;
  f15_low: number;
  volume_surge: number;
  atrs_to_tp: number;
  df_today: CandleData[];
}

interface OrderProposal {
  entry: number;
  sl: number;
  tp: number;
  qty: number;
}

class ForecastBot {
  // Utility functions
  private istNow(): Date {
    // Keep it simple: assume machine clock is IST or you can force tz-aware if needed
    return new Date();
  }

  private sessionTimes(day?: Date): [Date, Date] {
    if (!day) {
      day = this.istNow();
    }
    const start = new Date(day);
    start.setHours(9, 15, 0, 0);
    const end = new Date(day);
    end.setHours(9, 45, 0, 0);
    return [start, end];
  }

  // Technical analysis functions
  private computeVwap(candles: CandleData[]): number[] {
    const vwap: number[] = [];
    let cumPv = 0;
    let cumV = 0;

    for (const candle of candles) {
      const tp = (candle.high + candle.low + candle.close) / 3.0;
      cumPv += tp * candle.volume;
      cumV += candle.volume;
      vwap.push(cumV > 0 ? cumPv / cumV : 0);
    }

    return vwap;
  }

  private computeAtr(
    candles: CandleData[],
    n: number = ATR_LOOKBACK
  ): number[] {
    const atr: number[] = [];
    const tr: number[] = [];

    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i];
      let trueRange: number;

      if (i === 0) {
        trueRange = candle.high - candle.low;
      } else {
        const prevClose = candles[i - 1].close;
        trueRange = Math.max(
          candle.high - candle.low,
          Math.abs(candle.high - prevClose),
          Math.abs(candle.low - prevClose)
        );
      }

      tr.push(trueRange);

      if (i < n - 1) {
        atr.push(0);
      } else {
        const atrValue = _.mean(tr.slice(i - n + 1, i + 1));
        atr.push(atrValue);
      }
    }

    return atr;
  }

  private openingGapPct(todayOpen: number, prevClose: number): number {
    return prevClose ? (todayOpen - prevClose) / prevClose : NaN;
  }

  private firstRange(dfToday: CandleData[]): [number, number] {
    // First 15 minutes: 9:15–9:30 => three 5-min candles
    const sessionStart = new Date(dfToday[0].ts);
    sessionStart.setHours(9, 15, 0, 0);
    const first15End = new Date(sessionStart);
    first15End.setMinutes(first15End.getMinutes() + 15);

    const first15Candles = dfToday.filter(
      (candle) => candle.ts >= sessionStart && candle.ts < first15End
    );

    if (first15Candles.length === 0) {
      // Fallback: take first 3 candles by count
      const first3 = dfToday.slice(0, 3);
      return [
        Math.max(...first3.map((c) => c.high)),
        Math.min(...first3.map((c) => c.low)),
      ];
    }

    return [
      Math.max(...first15Candles.map((c) => c.high)),
      Math.min(...first15Candles.map((c) => c.low)),
    ];
  }

  private latestIndicatorPack(
    dfAll: CandleData[],
    sessionStart: Date
  ): IndicatorPack | null {
    // Split into prev day and today based on session_start date
    const sessionDate = sessionStart.toDateString();
    const dfPrev = dfAll.filter(
      (candle) => candle.ts.toDateString() < sessionDate
    );
    const dfToday = dfAll.filter(
      (candle) => candle.ts.toDateString() === sessionDate
    );

    if (dfToday.length < 5) {
      return null;
    }

    // Previous close from last prior candle
    const prevClose = dfPrev.length > 0 ? dfPrev[dfPrev.length - 1].close : NaN;
    const todayOpen = dfToday[0].open;

    const gap = !isNaN(prevClose)
      ? this.openingGapPct(todayOpen, prevClose)
      : NaN;

    // Indicators on today's series only
    const vwap = this.computeVwap(dfToday);
    const atr = this.computeAtr(dfToday, ATR_LOOKBACK);
    const volMa = this.computeVolumeMA(dfToday, VOL_LOOKBACK);

    const [f15High, f15Low] = this.firstRange(dfToday);
    const last = dfToday[dfToday.length - 1];
    const ltp = last.close;
    const lastVwap = vwap[vwap.length - 1];
    const lastAtr = atr[atr.length - 1];
    const lastVolMa = volMa[volMa.length - 1];
    const curVol = last.volume;

    const distToTpPct = 0.02; // fixed +2%
    // How many ATRs away is +2%?
    const atrsToTp =
      !isNaN(lastAtr) && lastAtr > 0 ? (ltp * distToTpPct) / lastAtr : NaN;

    const volumeSurge =
      !isNaN(lastVolMa) && lastVolMa > 0 ? curVol / lastVolMa : NaN;

    return {
      ltp,
      vwap: lastVwap,
      atr: lastAtr,
      prev_close: prevClose,
      today_open: todayOpen,
      opening_gap_pct: gap,
      f15_high: f15High,
      f15_low: f15Low,
      volume_surge: volumeSurge,
      atrs_to_tp: atrsToTp,
      df_today: dfToday,
    };
  }

  private computeVolumeMA(candles: CandleData[], n: number): number[] {
    const volMa: number[] = [];

    for (let i = 0; i < candles.length; i++) {
      if (i < n - 1) {
        volMa.push(0);
      } else {
        const volSlice = candles.slice(i - n + 1, i + 1).map((c) => c.volume);
        volMa.push(_.mean(volSlice));
      }
    }

    return volMa;
  }

  private relativeStrengthVsNifty(
    stockDfToday: CandleData[],
    niftyDfToday: CandleData[]
  ): number {
    // Simple: last return from day open for both
    if (
      stockDfToday.length === 0 ||
      !niftyDfToday ||
      niftyDfToday.length === 0
    ) {
      return NaN;
    }

    const sOpen = stockDfToday[0].open;
    const nOpen = niftyDfToday[0].open;
    const sLast = stockDfToday[stockDfToday.length - 1].close;
    const nLast = niftyDfToday[niftyDfToday.length - 1].close;
    const sRet = (sLast - sOpen) / sOpen;
    const nRet = (nLast - nOpen) / nOpen;
    return sRet - nRet;
  }

  private scoreSignal(
    pack: IndicatorPack,
    relStr: number = NaN
  ): [number, string[]] {
    let score = 0.0;
    const reasons: string[] = [];

    // 1) Above VWAP (momentum memory)
    if (pack.ltp > pack.vwap) {
      score += 0.8;
      reasons.push("Above VWAP (+0.8)");
    }

    // 2) 15m range breakout/retake
    if (pack.ltp > pack.f15_high) {
      score += 1.1;
      reasons.push("Breakout above first 15m high (+1.1)");
    } else if (pack.ltp > pack.f15_high * 0.999 && pack.ltp > pack.vwap) {
      score += 0.6;
      reasons.push("Near/retake 15m high with VWAP support (+0.6)");
    }

    // 3) Volume surge
    if (!isNaN(pack.volume_surge) && pack.volume_surge >= VOLUME_SURGE_X) {
      score += 1.0;
      reasons.push(`Volume surge x${pack.volume_surge.toFixed(2)} (+1.0)`);
    }

    // 4) Opening gap in a sweet spot (avoid exhaustion)
    if (!isNaN(pack.opening_gap_pct)) {
      if (0.0 <= pack.opening_gap_pct && pack.opening_gap_pct <= 0.015) {
        score += 0.6;
        reasons.push(
          `Healthy opening gap ${(pack.opening_gap_pct * 100).toFixed(
            2
          )}% (+0.6)`
        );
      } else if (pack.opening_gap_pct < 0) {
        score += 0.2;
        reasons.push("Gap-down reclaim (+0.2)");
      }
    }

    // 5) Target feasibility: ≤1.2 ATR to +2%
    if (!isNaN(pack.atrs_to_tp) && pack.atrs_to_tp <= 1.2) {
      score += 0.6;
      reasons.push(`TP within ${pack.atrs_to_tp.toFixed(2)} ATRs (+0.6)`);
    }

    // 6) Relative strength vs NIFTY
    if (!isNaN(relStr) && relStr > 0) {
      score += 0.4;
      reasons.push(
        `Relative strength vs NIFTY ${(relStr * 100).toFixed(2)}% (+0.4)`
      );
    }

    return [score, reasons];
  }

  private proposeOrders(
    pack: IndicatorPack,
    accountEquityInr: number
  ): OrderProposal {
    const ltp = pack.ltp;
    const atr = pack.atr;
    const f15Low = pack.f15_low;
    const vwap = pack.vwap;

    const tp = Math.round(ltp * 1.02 * 100) / 100;

    // ATR-based stop: use max of (VWAP - 0.5*ATR) and (f15_low) but not tighter than 0.8%
    let slLevel: number;
    if (!isNaN(atr)) {
      slLevel = Math.max(!isNaN(f15Low) ? f15Low : 0.0, vwap - 0.5 * atr);
    } else {
      slLevel = !isNaN(f15Low) ? f15Low : ltp * (1 - FALLBACK_MIN_STOP_PCT);
    }

    // Ensure at least FALLBACK_MIN_STOP_PCT away
    const minStop = ltp * (1 - FALLBACK_MIN_STOP_PCT);
    const sl = Math.round(Math.min(slLevel, minStop) * 100) / 100;

    // never under 0.8% assumed slip
    const riskPerShare = Math.max(ltp - sl, ltp * 0.008);
    const rupeesRisk = accountEquityInr * ACCOUNT_RISK_PER_TRADE;
    const qty = Math.max(1, Math.floor(rupeesRisk / riskPerShare));

    return { entry: ltp, sl, tp, qty };
  }

  // Main evaluation function (placeholder - would need actual API integration)
  public evaluateSymbol(
    growwSymbol: string,
    accountEquityInr: number = 200000
  ): void {
    console.log(`\nEvaluating ${growwSymbol}`);
    console.log(
      "Note: This is a placeholder - actual API integration would be needed"
    );
    console.log(
      "The brain logic has been converted to TypeScript and is ready for integration"
    );
  }

  public async start(): Promise<void> {
    this.evaluateSymbol("NSE-BAJAJHCARE", 500000);
  }
}

// Create and start the bot
const bot = new ForecastBot();

// Start the bot
bot.start().catch((error) => {
  console.error("❌ Failed to start bot:", error);
  process.exit(1);
});

export default ForecastBot;
