import dotenv from "dotenv";
dotenv.config();

export async function ganaka<T>({ fn }: { fn: () => Promise<T> }) {
  // CALL STRATEGY
  return await fn();
}
