import dotenv from "dotenv";
import { runsApi } from "./apis/runs/runs";
import { scheduleRun } from "./scheduler/scheduler";
import { RunContext } from "./scheduler/types";
dotenv.config();

export async function ganaka<T>({
  fn,
  pendingRunsCheckInterval = 10000,
}: {
  fn: (context: RunContext) => Promise<T>;
  pendingRunsCheckInterval?: number;
}) {
  // Track active runs to prevent duplicate processing
  const activeRuns = new Set<string>();

  // Continuous polling loop
  const pollForRuns = async () => {
    try {
      // Fetch pending runs
      const result = await runsApi.getRuns();

      if (!result || !result.data) {
        console.error("Failed to fetch runs or no data returned");
        return;
      }

      // Filter for PENDING runs that are not already being processed
      const pendingRuns = result.data.filter(
        (run: { id: string; status: string }) =>
          run.status === "PENDING" && !activeRuns.has(run.id)
      );

      if (pendingRuns.length === 0) {
        return;
      }

      console.log(`Found ${pendingRuns.length} new PENDING run(s)`);

      // Process each PENDING run (non-blocking)
      for (const run of pendingRuns) {
        // Mark as active
        activeRuns.add(run.id);

        // Schedule run without blocking
        scheduleRun(run, fn)
          .then(() => {
            activeRuns.delete(run.id);
          })
          .catch((error) => {
            console.error(`Error processing run ${run.id}:`, error);
            activeRuns.delete(run.id);
          });
      }
    } catch (error) {
      console.error("Error in polling loop:", error);
    }
  };

  // Initial poll
  await pollForRuns();

  // Set up continuous polling
  const intervalId = setInterval(pollForRuns, pendingRunsCheckInterval);

  // Keep the process alive
  // Note: In a real application, you might want to handle graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(intervalId);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    clearInterval(intervalId);
    process.exit(0);
  });
}
