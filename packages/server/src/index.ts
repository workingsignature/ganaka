import autoLoad from "@fastify/autoload";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import websocket from "@fastify/websocket";
import dotenv from "dotenv";
import Fastify from "fastify";
import path from "path";
import { prisma } from "./helpers/prisma";
import authPlugin from "./plugins/auth";
import socket from "./socket/socket";

dotenv.config();
const port = process.env.PORT ? parseInt(process.env.PORT) : 4400;
const host = process.env.HOST || "0.0.0.0";

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

// // Register routes with authentication plugins
// User routes (/v1) - protected with Clerk authentication
fastify.register(async function (fastify, opts) {
  await authPlugin("core")(fastify, opts);

  // Register user routes
  fastify.register(autoLoad, {
    dir: path.join(__dirname, "routes/v1/core"),
    options: { prefix: "/v1/core/" },
    maxDepth: 3,
  });
});

// Developer routes (/v1/developer) - protected with developer key authentication
fastify.register(async function (fastify, opts) {
  await authPlugin("developer")(fastify, opts);

  // Register developer routes
  fastify.register(autoLoad, {
    dir: path.join(__dirname, "routes/v1/developer"),
    options: { prefix: "/v1/developer/" },
    maxDepth: 3,
  });
});

// General routes (no authentication required)
fastify.register(autoLoad, {
  dir: path.join(__dirname, "routes/public/"),
  maxDepth: 3,
});

// Register websocket
fastify.register(socket);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port, host });
    fastify.log.info(
      `WebSocket server running on ws://${host}:${port}/connect`
    );
    await prisma.$connect();
    fastify.log.info("Database connection established successfully");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
