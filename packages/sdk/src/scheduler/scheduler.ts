import { Cron } from "croner";
import { runsApi } from "../apis/runs/runs";
import { RunItem, RunContext } from "./types";
import { generateExecutionTimes } from "./utils";

type UserFunction<T> = (context: RunContext) => Promise<T>;

/**
 * Schedule and execute a run based on its type (BACKTEST or LIVE)
 */
export async function scheduleRun<T>(
  run: RunItem,
  fn: UserFunction<T>
): Promise<void> {
  try {
    // Update run status to RUNNING
    await runsApi.updateRun(run.id, { status: "RUNNING" });

    // Generate all execution times from schedule
    const executionTimes = generateExecutionTimes(run);

    if (executionTimes.length === 0) {
      console.warn(`No execution times found for run ${run.id}`);
      await runsApi.updateRun(run.id, { status: "COMPLETED" });
      return;
    }

    if (run.runType === "BACKTEST") {
      // For BACKTEST: execute all timeslots immediately (sequential)
      await executeBacktest(run, executionTimes, fn);
    } else if (run.runType === "LIVE") {
      // For LIVE: schedule all timeslots within startDateTime/endDateTime range
      await scheduleLive(run, executionTimes, fn);
    } else {
      console.error(`Unknown run type: ${run.runType}`);
      await runsApi.updateRun(run.id, { status: "FAILED" });
      return;
    }

    // Update run status to COMPLETED
    await runsApi.updateRun(run.id, { status: "COMPLETED" });
  } catch (error) {
    console.error(`Error scheduling run ${run.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    await runsApi.updateRun(run.id, {
      status: "FAILED",
      errorLog: errorMessage,
    });
  }
}

/**
 * Execute BACKTEST mode: run all timeslots immediately sequentially
 */
async function executeBacktest<T>(
  run: RunItem,
  executionTimes: Array<{
    executionTime: string;
    timeslot: { startTime: string; endTime: string; interval: number };
    day: string;
    shortlist: unknown[];
  }>,
  fn: UserFunction<T>
): Promise<void> {
  console.log(
    `Starting BACKTEST for run ${run.id} with ${executionTimes.length} execution times`
  );

  for (const execTime of executionTimes) {
    try {
      const context: RunContext = {
        run,
        timeslot: execTime.timeslot,
        shortlist: execTime.shortlist as RunContext["shortlist"],
        executionTime: execTime.executionTime,
      };

      console.log(
        `Executing BACKTEST at ${execTime.executionTime} for run ${run.id}`
      );
      await fn(context);
    } catch (error) {
      // Log error and continue with next timeslot
      console.error(
        `Error executing BACKTEST at ${execTime.executionTime} for run ${run.id}:`,
        error
      );
      // Continue to next execution
    }
  }

  console.log(`Completed BACKTEST for run ${run.id}`);
}

/**
 * Schedule LIVE mode: use croner to schedule all timeslots
 */
async function scheduleLive<T>(
  run: RunItem,
  executionTimes: Array<{
    executionTime: string;
    timeslot: { startTime: string; endTime: string; interval: number };
    day: string;
    shortlist: unknown[];
  }>,
  fn: UserFunction<T>
): Promise<void> {
  console.log(
    `Scheduling LIVE run ${run.id} with ${executionTimes.length} execution times`
  );

  const scheduledJobs: Cron[] = [];
  const now = new Date();

  for (const execTime of executionTimes) {
    const executionDate = new Date(execTime.executionTime);

    // Only schedule future executions
    if (executionDate > now) {
      const job = new Cron(executionDate, async () => {
        try {
          const context: RunContext = {
            run,
            timeslot: execTime.timeslot,
            shortlist: execTime.shortlist as RunContext["shortlist"],
            executionTime: execTime.executionTime,
          };

          console.log(
            `Executing LIVE at ${execTime.executionTime} for run ${run.id}`
          );
          await fn(context);
        } catch (error) {
          // Log error and continue
          console.error(
            `Error executing LIVE at ${execTime.executionTime} for run ${run.id}:`,
            error
          );
        }
      });

      if (job) {
        scheduledJobs.push(job);
        console.log(
          `Scheduled LIVE execution at ${execTime.executionTime} for run ${run.id}`
        );
      } else {
        console.warn(
          `Failed to schedule execution at ${execTime.executionTime} for run ${run.id}`
        );
      }
    } else {
      console.log(
        `Skipping past execution time ${execTime.executionTime} for run ${run.id}`
      );
    }
  }

  // Wait for all scheduled jobs to complete
  // Note: In a real implementation, you might want to keep the process alive
  // and handle job completion differently. For now, we'll wait until the last scheduled time.
  const lastExecutionTime =
    executionTimes.length > 0
      ? new Date(executionTimes[executionTimes.length - 1].executionTime)
      : now;

  if (lastExecutionTime > now) {
    const waitTime = lastExecutionTime.getTime() - now.getTime();
    console.log(
      `Waiting ${Math.round(
        waitTime / 1000 / 60
      )} minutes for all LIVE executions to complete for run ${run.id}`
    );
    // Wait for the last execution time plus a buffer
    await new Promise(
      (resolve) => setTimeout(resolve, waitTime + 60000) // Add 1 minute buffer
    );
  }

  console.log(`Completed scheduling LIVE run ${run.id}`);
}
