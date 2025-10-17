import { FastifyReply } from "fastify";
import z from "zod";

export function validateRequest<T>(
  data: unknown,
  reply: FastifyReply,
  schema: z.ZodSchema<T>,
  type: "headers" | "params" | "query" | "body" = "body"
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.badRequest(
        `Validation failed for ${type}: ${error.issues
          .map((err) => err.path.join(".") + ": " + err.message)
          .join(", ")}`
      );
    } else {
      reply.internalServerError(
        "An unexpected error occurred during validation"
      );
    }
    return null;
  }
}
