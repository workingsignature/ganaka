import { FastifyReply } from "fastify";
import z from "zod";

export function validateRequest<T>(
  data: unknown,
  reply: FastifyReply,
  schema: z.ZodSchema<T>
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.code(400).send({
        error: "Validation failed",
        details: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    } else {
      reply.code(500).send({
        error: "Internal server error",
        message: "An unexpected error occurred during validation",
      });
    }
    return null;
  }
}
