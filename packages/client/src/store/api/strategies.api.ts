import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import z from "zod";

// Define types for your API
export interface StrategyItem {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export const createStrategyAPISchema = {
  body: z.object({
    name: z.string(),
    description: z.string(),
  }),
  response: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isPublic: z.boolean(),
  }),
};

// Define a service using a base URL and expected endpoints
export const strategiesApi = createApi({
  reducerPath: "strategiesAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["strategies"],
  endpoints: (builder) => ({
    createStrategy: builder.mutation<
      z.infer<typeof createStrategyAPISchema.response>,
      z.infer<typeof createStrategyAPISchema.body>
    >({
      query: (body) => ({
        url: `/strategies`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["strategies"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useCreateStrategyMutation } = strategiesApi;
