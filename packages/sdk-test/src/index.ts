import { ganaka } from "@ganaka/sdk";

async function testGanaka() {
  console.log("Testing Ganaka SDK...\n");

  try {
    // Test the ganaka function
    const result = await ganaka({
      fn: async () => {
        console.log("Executing test function...");
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
