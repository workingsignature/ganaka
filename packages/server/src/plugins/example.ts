import { FastifyPluginAsync } from "fastify";

const examplePlugin: FastifyPluginAsync = async (fastify, opts) => {
  // Add a custom property to the fastify instance
  fastify.decorate("example", {
    message: "Hello from example plugin!",
  });

  // Add a custom method
  fastify.decorate("getExampleMessage", () => {
    return "This is an example method from the plugin";
  });

  fastify.log.info("Example plugin loaded");
};

export default examplePlugin;
