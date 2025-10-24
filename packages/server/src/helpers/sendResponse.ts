import { FastifyReply } from "fastify";

export const sendResponse = ({
  statusCode,
  message,
  data,
}: {
  statusCode: number;
  message: string;
  data: unknown;
}) => {
  return {
    statusCode,
    message,
    data,
  };
};
