import { Cron } from "croner";
import { Worker } from "worker_threads";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { runsApi } from "../apis/runs/runs";
import { ordersApi } from "../apis/orders/orders";
import { RunItem, RunContext, ExecutionTime } from "./types";
import { generateExecutionTimes } from "./utils";

type UserFunction<T> = (context: RunContext) => Promise<T>;

const EXECUTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Get the directory of the current module
// Handle both ES modules and CommonJS
function getWorkerPath(): string {
  // Get require function that works in both ESM and CJS
  let requireFn: NodeRequire;
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      // ES module - use createRequire
      requireFn = createRequire(import.meta.url);
    } else if (typeof require !== "undefined") {
      // CommonJS - use global require (available in CJS context)
      requireFn = require;
    } else {
      // Fallback - try createRequire with a file URL
      // This shouldn't normally happen, but handle it gracefully
      throw new Error("Neither require nor import.meta.url is available");
    }
  } catch (error) {
    // If all else fails, throw a more helpful error
    throw new Error(
      `Cannot resolve require function: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  // Try to resolve from the SDK package location first (most reliable)
  try {
    // Try to resolve the package.json to find the SDK package root
    const packagePath = requireFn.resolve("@ganaka/sdk/package.json");
    const packageDir = dirname(packagePath);
    const distWorkerPath = join(packageDir, "dist", "scheduler", "worker.js");

    // Check if the built worker file exists
    if (existsSync(distWorkerPath)) {
      return distWorkerPath;
    }
  } catch (error) {
    // Log the error for debugging, but continue to try other methods
    console.warn(
      `[getWorkerPath] Failed to resolve @ganaka/sdk/package.json: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  // Try alternative: resolve from the current module location
  // This works when the SDK is imported as a dependency (built or source)
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      // Get the current file's location
      const currentFile = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFile);

      // Check if we're in dist (built version)
      // Structure: packages/sdk/dist/scheduler/scheduler.js (or .mjs)
      // We want: packages/sdk/dist/scheduler/worker.js
      if (currentDir.includes("/dist/")) {
        const distWorkerPath = join(currentDir, "worker.js");
        if (existsSync(distWorkerPath)) {
          return distWorkerPath;
        }
      }

      // Check if we're in src (development/source version)
      // Structure: packages/sdk/src/scheduler/scheduler.ts
      // We want: packages/sdk/dist/scheduler/worker.js
      if (currentDir.includes("/src/")) {
        // Navigate: src/scheduler -> src -> package root -> dist/scheduler
        const srcDir = dirname(currentDir); // src
        const packageRoot = dirname(srcDir); // packages/sdk
        const distWorkerPath = join(
          packageRoot,
          "dist",
          "scheduler",
          "worker.js"
        );

        if (existsSync(distWorkerPath)) {
          return distWorkerPath;
        }
      }

      // Try navigating up to find dist/scheduler/worker.js
      // This handles cases where the file structure might be different
      let searchDir = currentDir;
      for (let i = 0; i < 5; i++) {
        const candidatePath = join(searchDir, "dist", "scheduler", "worker.js");
        if (existsSync(candidatePath)) {
          return candidatePath;
        }
        searchDir = dirname(searchDir);
      }
    }
  } catch (error) {
    // Fall through
  }

  // Try CommonJS __dirname first (for CJS builds)
  if (typeof (globalThis as { __dirname?: string }).__dirname !== "undefined") {
    const dirnameValue = (globalThis as { __dirname: string }).__dirname;
    const workerPath = join(dirnameValue, "worker.js");
    if (existsSync(workerPath)) {
      return workerPath;
    }
  }

  // Try ES module import.meta.url (for ES builds)
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const workerPath = join(__dirname, "worker.js");
      if (existsSync(workerPath)) {
        return workerPath;
      }
    }
  } catch {
    // Fall through
  }

  // Final fallback: relative to current working directory
  const fallbackPath = join(process.cwd(), "dist", "scheduler", "worker.js");

  // Log a warning if we're using the fallback path
  console.warn(
    `[getWorkerPath] Could not resolve worker from SDK package, using fallback: ${fallbackPath}`
  );

  return fallbackPath;
}

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

    // Create execution records in DB
    const executionRecords = await runsApi.createExecutions(
      run.id,
      executionTimes.map((execTime) => ({
        executionTime: execTime.executionTime,
        timeslot: execTime.timeslot,
        day: execTime.day,
      }))
    );

    if (!executionRecords || !executionRecords.data) {
      console.error(
        `Failed to create execution records for run ${run.id}, continuing anyway`
      );
    }

    // Create a map of executionTime -> executionId for later updates
    const executionMap = new Map<string, string>();
    if (executionRecords && executionRecords.data) {
      for (const execRecord of executionRecords.data) {
        executionMap.set(execRecord.executionTime, execRecord.id);
      }
    }

    if (run.runType === "BACKTEST") {
      // For BACKTEST: execute in worker thread (non-blocking)
      try {
        executeBacktestInWorker(run, executionTimes, fn, executionMap);
      } catch (error) {
        console.error(
          `Error spawning backtest worker for run ${run.id}:`,
          error
        );
        runsApi
          .updateRun(run.id, {
            status: "FAILED",
            errorLog: error instanceof Error ? error.message : String(error),
          })
          .catch((err) => {
            console.error(`Error updating run ${run.id} status:`, err);
          });
      }
      // Return immediately - don't wait for completion
      return;
    } else if (run.runType === "LIVE") {
      // For LIVE: schedule all timeslots (non-blocking)
      scheduleLive(run, executionTimes, fn, executionMap);
      // Return immediately - don't wait for completion
      return;
    } else {
      console.error(`Unknown run type: ${run.runType}`);
      await runsApi.updateRun(run.id, { status: "FAILED" });
      return;
    }
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
 * Execute BACKTEST mode: spawn worker thread to coordinate execution
 * The worker thread can be terminated if it exceeds the timeout
 */
export function executeBacktestInWorker<T>(
  run: RunItem,
  executionTimes: ExecutionTime[],
  fn: UserFunction<T>,
  executionMap: Map<string, string>
): void {
  console.log(
    `Starting BACKTEST worker for run ${run.id} with ${executionTimes.length} execution times`
  );

  // Determine worker file path
  // In a built package, the worker will be in the dist folder
  const workerPath = getWorkerPath();

  // Spawn worker thread
  const worker = new Worker(workerPath, {
    workerData: {
      run,
      executionTimes,
    },
  });

  // Set up 5-minute timeout to terminate worker if it exceeds limit
  const timeoutId = setTimeout(() => {
    console.warn(
      `Backtest worker for run ${run.id} exceeded ${
        EXECUTION_TIMEOUT_MS / 1000 / 60
      } minutes, terminating...`
    );
    worker.terminate();
    runsApi
      .updateRun(run.id, {
        status: "FAILED",
        errorLog: `Execution timeout: exceeded ${
          EXECUTION_TIMEOUT_MS / 1000 / 60
        } minutes`,
      })
      .catch((err) => {
        console.error(
          `Error updating run ${run.id} status after timeout:`,
          err
        );
      });
  }, EXECUTION_TIMEOUT_MS);

  // Handle messages from worker
  worker.on(
    "message",
    async (message: {
      type: string;
      executionTime?: ExecutionTime;
      error?: string;
    }) => {
      if (message.type === "execute" && message.executionTime) {
        const executionId = executionMap.get(
          message.executionTime.executionTime
        );
        const executedAt = new Date().toISOString();

        // Update execution status to mark as started
        if (executionId) {
          runsApi
            .updateExecution(run.id, executionId, {
              executedAt,
            })
            .catch((err) => {
              console.error(
                `Error updating execution ${executionId} start time:`,
                err
              );
            });
        }

        try {
          const context: RunContext = {
            run,
            timeslot: message.executionTime.timeslot,
            shortlist: message.executionTime.shortlist,
            executionTime: message.executionTime.executionTime,
            orders: {
              placeOrder: (orderData) => ordersApi.placeOrder(run.id, orderData),
              getOrders: (filters) => ordersApi.getOrders(run.id, filters),
              getOrder: (orderId) => ordersApi.getOrder(run.id, orderId),
              cancelOrder: (orderId) => ordersApi.cancelOrder(run.id, orderId),
            },
          };

          console.log(
            `Executing BACKTEST at ${message.executionTime.executionTime} for run ${run.id}`
          );

          // Execute user function with per-execution timeout
          await Promise.race([
            fn(context),
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      `Execution timeout: exceeded ${
                        EXECUTION_TIMEOUT_MS / 1000 / 60
                      } minutes`
                    )
                  ),
                EXECUTION_TIMEOUT_MS
              )
            ),
          ]);

          // Update execution status to COMPLETED
          if (executionId) {
            runsApi
              .updateExecution(run.id, executionId, {
                status: "COMPLETED",
                executedAt,
              })
              .catch((err) => {
                console.error(
                  `Error updating execution ${executionId} status:`,
                  err
                );
              });
          }

          // Notify worker that execution completed
          worker.postMessage({ type: "execution-complete" });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(
            `Error executing BACKTEST at ${message.executionTime.executionTime} for run ${run.id}:`,
            error
          );

          // Update execution status to FAILED
          if (executionId) {
            runsApi
              .updateExecution(run.id, executionId, {
                status: "FAILED",
                executedAt,
                errorLog: errorMessage,
              })
              .catch((err) => {
                console.error(
                  `Error updating execution ${executionId} failure status:`,
                  err
                );
              });
          }

          // Notify worker of error but continue
          worker.postMessage({
            type: "execution-error",
            error: errorMessage,
          });
        }
      } else if (message.type === "complete") {
        clearTimeout(timeoutId);
        console.log(`Completed BACKTEST for run ${run.id}`);
        // Check completion status via DB
        checkAndUpdateRunCompletion(run.id);
        worker.terminate();
      } else if (message.type === "error") {
        clearTimeout(timeoutId);
        console.error(
          `Backtest worker error for run ${run.id}:`,
          message.error
        );
        runsApi
          .updateRun(run.id, {
            status: "FAILED",
            errorLog: message.error,
          })
          .catch((err) => {
            console.error(`Error updating run ${run.id} status:`, err);
          });
        worker.terminate();
      }
    }
  );

  // Handle worker errors
  worker.on("error", (error) => {
    clearTimeout(timeoutId);
    console.error(`Worker error for run ${run.id}:`, error);
    runsApi
      .updateRun(run.id, {
        status: "FAILED",
        errorLog: error.message,
      })
      .catch((err) => {
        console.error(`Error updating run ${run.id} status:`, err);
      });
  });

  // Handle worker exit
  worker.on("exit", (code) => {
    clearTimeout(timeoutId);
    if (code !== 0) {
      console.error(`Worker for run ${run.id} exited with code ${code}`);
    }
  });
}

/**
 * Schedule LIVE mode: use croner to schedule all timeslots
 * Returns immediately after scheduling (non-blocking)
 */
export function scheduleLive<T>(
  run: RunItem,
  executionTimes: ExecutionTime[],
  fn: UserFunction<T>,
  executionMap: Map<string, string>
): void {
  console.log(
    `Scheduling LIVE run ${run.id} with ${executionTimes.length} execution times`
  );

  const scheduledJobs: Cron[] = [];
  const now = new Date();

  for (const execTime of executionTimes) {
    const executionDate = new Date(execTime.executionTime);

    // Only schedule future executions
    if (executionDate > now) {
      const executionId = executionMap.get(execTime.executionTime);
      const job = new Cron(executionDate, async () => {
        const executedAt = new Date().toISOString();

        // Update execution status to mark as started
        if (executionId) {
          runsApi
            .updateExecution(run.id, executionId, {
              executedAt,
            })
            .catch((err) => {
              console.error(
                `Error updating execution ${executionId} start time:`,
                err
              );
            });
        }

        try {
          const context: RunContext = {
            run,
            timeslot: execTime.timeslot,
            shortlist: execTime.shortlist,
            executionTime: execTime.executionTime,
            orders: {
              placeOrder: (orderData) => ordersApi.placeOrder(run.id, orderData),
              getOrders: (filters) => ordersApi.getOrders(run.id, filters),
              getOrder: (orderId) => ordersApi.getOrder(run.id, orderId),
              cancelOrder: (orderId) => ordersApi.cancelOrder(run.id, orderId),
            },
          };

          console.log(
            `Executing LIVE at ${execTime.executionTime} for run ${run.id}`
          );

          // Execute with 5-minute timeout
          await Promise.race([
            fn(context),
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      `Execution timeout: exceeded ${
                        EXECUTION_TIMEOUT_MS / 1000 / 60
                      } minutes`
                    )
                  ),
                EXECUTION_TIMEOUT_MS
              )
            ),
          ]);

          // Update execution status to COMPLETED
          if (executionId) {
            runsApi
              .updateExecution(run.id, executionId, {
                status: "COMPLETED",
                executedAt,
              })
              .catch((err) => {
                console.error(
                  `Error updating execution ${executionId} status:`,
                  err
                );
              });
          }

          // Check if all executions are complete by querying DB
          checkAndUpdateRunCompletion(run.id);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          // Log error and continue
          console.error(
            `Error executing LIVE at ${execTime.executionTime} for run ${run.id}:`,
            error
          );

          // Update execution status to FAILED
          if (executionId) {
            runsApi
              .updateExecution(run.id, executionId, {
                status: "FAILED",
                executedAt,
                errorLog: errorMessage,
              })
              .catch((err) => {
                console.error(
                  `Error updating execution ${executionId} failure status:`,
                  err
                );
              });
          }

          // Check if all executions are complete by querying DB
          checkAndUpdateRunCompletion(run.id);
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
      // Mark past execution as SKIPPED
      const executionId = executionMap.get(execTime.executionTime);
      if (executionId) {
        runsApi
          .updateExecution(run.id, executionId, {
            status: "SKIPPED",
          })
          .catch((err) => {
            console.error(
              `Error updating execution ${executionId} to SKIPPED:`,
              err
            );
          });
      }
    }
  }

  // Check if all executions are complete (for past executions)
  checkAndUpdateRunCompletion(run.id);

  console.log(`Completed scheduling LIVE run ${run.id}`);
}

/**
 * Check if all executions for a run are complete and update run status accordingly
 */
async function checkAndUpdateRunCompletion(runId: string): Promise<void> {
  try {
    const incompleteResult = await runsApi.getIncompleteExecutions(runId);
    if (
      incompleteResult &&
      incompleteResult.data &&
      incompleteResult.data.length === 0
    ) {
      // All executions are complete
      runsApi.updateRun(runId, { status: "COMPLETED" }).catch((err) => {
        console.error(`Error updating run ${runId} status:`, err);
      });
    }
  } catch (error) {
    console.error(`Error checking completion status for run ${runId}:`, error);
  }
}
