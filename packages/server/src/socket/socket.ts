import { FastifyInstance } from "fastify";

export default function socket(fastify: FastifyInstance) {
  fastify.get("/connect", { websocket: true }, (socket, req) => {
    socket.on("message", (message) => {
      socket.send("hi from server");
    });
  });
}
