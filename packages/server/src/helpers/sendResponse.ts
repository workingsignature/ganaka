import { apiResponseSchema } from "@ganaka/api-schemas";

export function sendResponse<T>({
  statusCode,
  message,
  data,
}: {
  statusCode: number;
  message: string;
  data: T;
}) {
  return apiResponseSchema.parse({
    statusCode,
    message,
    data,
  });
}
