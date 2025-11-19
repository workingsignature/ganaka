import dotenv from "dotenv";
import { runsApi } from "./apis/runs/runs";
import { scheduleRun } from "./scheduler/scheduler";
import { RunContext } from "./scheduler/types";
dotenv.config();

export async function ganaka<T>({
  fn,
}: {
  fn: (context: RunContext) => Promise<T>;
}) {
  // Fetch all runs
  const result = await runsApi.getRuns();

  if (!result || !result.data) {
    console.error("Failed to fetch runs or no data returned");
    return;
  }

  // Filter for PENDING runs
  const pendingRuns = result.data.filter(
    (run: { status: string }) => run.status === "PENDING"
  );

  if (pendingRuns.length === 0) {
    console.log("No PENDING runs found");
    return;
  }

  console.log(`Found ${pendingRuns.length} PENDING run(s)`);

  // Process each PENDING run sequentially
  for (const run of pendingRuns) {
    try {
      await scheduleRun(run, fn);
    } catch (error) {
      console.error(`Error processing run ${run.id}:`, error);
      // Continue with next run even if one fails
    }
  }
}
