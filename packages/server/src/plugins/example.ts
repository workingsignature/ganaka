import { FastifyPluginAsync } from "fastify";

/**
 * Example Plugin
 *
 * This is a template plugin showing how to create Fastify plugins.
 * It demonstrates:
 * - Adding custom properties to the fastify instance
 * - Adding custom methods
 * - Plugin lifecycle logging
 */
const examplePlugin: FastifyPluginAsync = async (fastify, opts) => {
  // Add a custom property to the fastify instance
  fastify.decorate("example", {
    message: "Hello from example plugin!",
  });

  // Add a custom method
  fastify.decorate("getExampleMessage", () => {
    return "This is an example method from the plugin";
  });

  // Example of adding a hook (optional)
  fastify.addHook("onRequest", async (request, reply) => {
    fastify.log.debug(`Example plugin: Request to ${request.url}`);
  });

  fastify.log.info("Example plugin loaded");
};

export default examplePlugin;
