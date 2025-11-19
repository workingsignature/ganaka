import dotenv from "dotenv";
import { runsApi } from "./apis/runs/runs";
dotenv.config();

export async function ganaka<T>({ fn }: { fn: () => Promise<T> }) {
  const result = await runsApi.getRuns();
  console.log(result);
  // CALL STRATEGY
  return await fn();
}
