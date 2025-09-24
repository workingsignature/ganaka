import Fastify from "fastify";
import { join } from "path";

const fastify = Fastify({
  logger: {
    level: "info",
  },
});

// Register plugins
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/cors"), {
  origin: true,
});

// Auto-load plugins
fastify.register(require("@fastify/autoload"), {
  dir: join(__dirname, "plugins"),
  options: { prefix: "/api" },
});

// Auto-load routes
fastify.register(require("@fastify/autoload"), {
  dir: join(__dirname, "routes"),
  options: { prefix: "/api" },
});

// Health check route
fastify.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
