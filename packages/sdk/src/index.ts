import dotenv from "dotenv";
import { runsApi } from "./apis/runs/runs";
import { scheduleRun } from "./scheduler/scheduler";
import { RunContext, RunItem } from "./scheduler/types";
import { generateExecutionTimes } from "./scheduler/utils";
dotenv.config();

/**
 * Recover RUNNING runs by rescheduling incomplete executions
 */
async function recoverRunningRuns<T>(
  fn: (context: RunContext) => Promise<T>
): Promise<void> {
  try {
    // Fetch RUNNING runs
    const result = await runsApi.getRuns("RUNNING");

    if (!result || !result.data || result.data.length === 0) {
      console.log("No RUNNING runs to recover");
      return;
    }

    console.log(`Found ${result.data.length} RUNNING run(s) to recover`);

    // Process each RUNNING run
    for (const run of result.data as RunItem[]) {
      try {
        // Get incomplete executions
        const incompleteResult = await runsApi.getIncompleteExecutions(run.id);

        if (
          !incompleteResult ||
          !incompleteResult.data ||
          incompleteResult.data.length === 0
        ) {
          console.log(
            `No incomplete executions found for run ${run.id}, checking completion status`
          );
          // Check if run should be marked as completed
          const checkResult = await runsApi.getIncompleteExecutions(run.id);
          if (
            checkResult &&
            checkResult.data &&
            checkResult.data.length === 0
          ) {
            await runsApi.updateRun(run.id, { status: "COMPLETED" });
          }
          continue;
        }

        console.log(
          `Recovering ${incompleteResult.data.length} incomplete execution(s) for run ${run.id}`
        );

        // Regenerate execution times from schedule
        const allExecutionTimes = generateExecutionTimes(run);

        // Create a map of executionTime -> execution record
        const incompleteExecutionsMap = new Map<
          string,
          (typeof incompleteResult.data)[0]
        >();
        for (const exec of incompleteResult.data) {
          incompleteExecutionsMap.set(exec.executionTime, exec);
        }

        // Filter execution times to only include incomplete ones
        const incompleteExecutionTimes = allExecutionTimes.filter((execTime) =>
          incompleteExecutionsMap.has(execTime.executionTime)
        );

        if (incompleteExecutionTimes.length === 0) {
          console.log(
            `No matching incomplete executions found for run ${run.id}`
          );
          continue;
        }

        // Create execution map for rescheduling
        const executionMap = new Map<string, string>();
        for (const exec of incompleteResult.data) {
          executionMap.set(exec.executionTime, exec.id);
        }

        // Reschedule incomplete executions based on run type
        if (run.runType === "BACKTEST") {
          // For BACKTEST: execute remaining incomplete executions immediately
          console.log(
            `Rescheduling ${incompleteExecutionTimes.length} BACKTEST execution(s) for run ${run.id}`
          );
          const { executeBacktestInWorker } = await import(
            "./scheduler/scheduler"
          );
          executeBacktestInWorker(
            run,
            incompleteExecutionTimes,
            fn,
            executionMap
          );
        } else if (run.runType === "LIVE") {
          // For LIVE: reschedule remaining incomplete executions
          console.log(
            `Rescheduling ${incompleteExecutionTimes.length} LIVE execution(s) for run ${run.id}`
          );
          const { scheduleLive } = await import("./scheduler/scheduler");
          scheduleLive(run, incompleteExecutionTimes, fn, executionMap);
        }
      } catch (error) {
        console.error(`Error recovering run ${run.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in recovery process:", error);
  }
}

export async function ganaka<T>({
  fn,
  pendingRunsCheckInterval = 10000,
}: {
  fn: (context: RunContext) => Promise<T>;
  pendingRunsCheckInterval?: number;
}) {
  // Track active runs to prevent duplicate processing
  const activeRuns = new Set<string>();

  // Recover RUNNING runs on startup
  await recoverRunningRuns(fn);

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
