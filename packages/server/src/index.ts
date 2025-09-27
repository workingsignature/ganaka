import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import websocket from "@fastify/websocket";
import socket from "./socket/socket";
import path from "path";

const fastify = Fastify({
  logger: {
    level: "info",
  },
});

// Register plugins
fastify.register(websocket);
fastify.register(sensible);
fastify.register(cors, {
  origin: true,
});

// Register routes
fastify.register(autoLoad, {
  dir: path.join(__dirname, "routes/v1"),
  options: { prefix: "/v1/" },
});

// Register websocket
fastify.register(socket);

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
    fastify.log.info(
      `WebSocket server running on ws://${host}:${port}/connect`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
