import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface BotConfig {
  name: string;
  version: string;
  port?: number;
}

class ForecastBot {
  private config: BotConfig;

  constructor() {
    this.config = {
      name: process.env.BOT_NAME || "ForecastBot",
      version: process.env.BOT_VERSION || "1.0.0",
      port: parseInt(process.env.PORT || "3000", 10),
    };
  }

  public async start(): Promise<void> {
    console.log(`🚀 Starting ${this.config.name} v${this.config.version}`);
    console.log(`📡 Bot is running on port ${this.config.port}`);

    // Bot initialization logic here
    this.setupEventHandlers();

    console.log("✅ Bot is ready and listening for events...");
  }

  private setupEventHandlers(): void {
    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Received SIGINT, shutting down gracefully...");
      this.shutdown();
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
      this.shutdown();
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      this.shutdown(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      this.shutdown(1);
    });
  }

  private shutdown(exitCode: number = 0): void {
    console.log("🔄 Cleaning up resources...");
    // Add cleanup logic here
    console.log("✅ Shutdown complete");
    process.exit(exitCode);
  }

  public getConfig(): BotConfig {
    return this.config;
  }
}

// Create and start the bot
const bot = new ForecastBot();

// Start the bot
bot.start().catch((error) => {
  console.error("❌ Failed to start bot:", error);
  process.exit(1);
});

export default ForecastBot;
