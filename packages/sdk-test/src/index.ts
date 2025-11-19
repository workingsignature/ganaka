import { ganaka } from "@ganaka/sdk";
import dayjs from "dayjs";

async function testGanaka() {
  console.log("Testing Ganaka SDK...\n");

  try {
    // Test the ganaka function
    const result = await ganaka({
      fn: async (context) => {
        console.log(
          `Executing test function for run ${context.run.id} at ${dayjs(
            context.executionTime
          ).format("YYYY-MM-DD HH:mm:ss")}`
        );
        return { success: true, message: "Test completed successfully" };
      },
    });

    console.log("Result:", result);
    console.log("\n✅ SDK test passed!");
  } catch (error) {
    console.error("❌ SDK test failed:", error);
    process.exit(1);
  }
}

testGanaka();
