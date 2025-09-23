import { FastifyPluginAsync } from "fastify";

const exampleRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Example GET route
  fastify.get("/example", async (request, reply) => {
    return {
      message: "Hello from example route!",
      timestamp: new Date().toISOString(),
      pluginData: fastify.example,
      pluginMethod: fastify.getExampleMessage(),
    };
  });

  // Example POST route
  fastify.post("/example", async (request, reply) => {
    const body = request.body as any;
    return {
      message: "POST request received",
      data: body,
      timestamp: new Date().toISOString(),
    };
  });

  // Example route with parameters
  fastify.get("/example/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      message: `Example with ID: ${id}`,
      timestamp: new Date().toISOString(),
    };
  });
};

export default exampleRoutes;
