import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import websocket from "@fastify/websocket";
import socket from "./socket/socket";
import path from "path";
import dotenv from "dotenv";
import { prisma } from "./helpers/prisma";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { groww } from "./helpers/groww";
import userAuthPlugin from "./plugins/userAuth";
import developerAuthPlugin from "./plugins/developerAuth";

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
fastify.register(swagger, {
  openapi: {
    info: {
      title: "Ganaka API",
      description: "API documentation for Ganaka",
      version: "0.0.1",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
      {
        url: `https://staging.weatherman.rraj.dev`,
        description: "Staging server",
      },
      {
        url: `https://weatherman.rraj.dev`,
        description: "Production server",
      },
    ],
  },
});
fastify.register(swaggerUi, {
  routePrefix: "/docs",
  theme: {
    title: "Ganaka API",
  },
});

// Register routes with authentication plugins
// User routes (/v1) - protected with Clerk authentication
fastify.register(async function (fastify) {
  // Register user authentication plugin for all routes in this scope
  fastify.register(userAuthPlugin);

  // Register user routes
  fastify.register(autoLoad, {
    dir: path.join(__dirname, "routes/v1/client"),
    options: { prefix: "/v1/" },
  });
});

// Developer routes (/v1/developer) - protected with developer key authentication
fastify.register(async function (fastify) {
  // Register developer authentication plugin for all routes in this scope
  fastify.register(developerAuthPlugin);

  // Register developer routes
  fastify.register(autoLoad, {
    dir: path.join(__dirname, "routes/v1/developer"),
    options: { prefix: "/v1/developer/" },
  });
});

// General routes (no authentication required)
fastify.register(autoLoad, {
  dir: path.join(__dirname, "routes/general"),
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
    fastify.log.info(
      `Swagger documentation available at http://${host}:${port}/docs`
    );
    await prisma.$connect();
    fastify.log.info("Database connection established successfully");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
