import { parentPort, workerData } from "worker_threads";
import { ExecutionTime, RunItem } from "./types";

type WorkerData = {
  run: RunItem;
  executionTimes: ExecutionTime[];
};

type WorkerMessage =
  | { type: "execute"; executionTime: ExecutionTime }
  | { type: "complete" }
  | { type: "error"; error: string }
  | { type: "execution-complete" }
  | { type: "execution-error"; error?: string };

/**
 * Worker thread for coordinating backtest execution
 * The worker sends execution requests to the main thread,
 * which executes the user function and sends results back.
 * This allows the worker to be terminated if it times out.
 */
async function coordinateBacktestExecution() {
  try {
    const { run, executionTimes } = workerData as WorkerData;

    console.log(
      `[Worker] Starting BACKTEST coordination for run ${run.id} with ${executionTimes.length} execution times`
    );

    for (const execTime of executionTimes) {
      try {
        // Request execution from main thread
        if (parentPort) {
          parentPort.postMessage({
            type: "execute",
            executionTime: execTime,
          } as WorkerMessage);

          // Wait for execution to complete
          await new Promise<void>((resolve, reject) => {
            if (!parentPort) {
              resolve();
              return;
            }

            const messageHandler = (message: WorkerMessage) => {
              if (message.type === "execution-complete") {
                parentPort?.removeListener("message", messageHandler);
                resolve();
              } else if (message.type === "execution-error") {
                parentPort?.removeListener("message", messageHandler);
                console.error(
                  `[Worker] Execution error for ${execTime.executionTime}:`,
                  message.error
                );
                resolve(); // Continue to next execution
              }
            };
            parentPort.on("message", messageHandler);
          });
        }
      } catch (error) {
        console.error(
          `[Worker] Error coordinating execution at ${execTime.executionTime} for run ${run.id}:`,
          error
        );
        // Continue to next execution
      }
    }

    console.log(`[Worker] Completed BACKTEST coordination for run ${run.id}`);

    if (parentPort) {
      parentPort.postMessage({ type: "complete" } as WorkerMessage);
    }
  } catch (error) {
    console.error("[Worker] Fatal error:", error);
    if (parentPort) {
      parentPort.postMessage({
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      } as WorkerMessage);
    }
  }
}

// Start coordination
coordinateBacktestExecution().catch((error) => {
  console.error("[Worker] Unhandled error:", error);
  if (parentPort) {
    parentPort.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    } as WorkerMessage);
  }
});
