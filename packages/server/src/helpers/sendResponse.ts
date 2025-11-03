import { apiResponseSchema } from "@ganaka/server-schemas";

export function sendResponse<T>(data: T) {
  return apiResponseSchema.parse(data);
}
