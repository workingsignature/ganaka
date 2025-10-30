import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";

// Define types for your API
export interface StrategyItem {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export interface GetStrategiesParams {
  botId: string;
}

export interface GetStrategiesResponse {
  data: StrategyItem[];
  success: boolean;
  message?: string;
}

// Define a service using a base URL and expected endpoints
export const strategiesApi = createApi({
  reducerPath: "strategiesAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["strategies"],
  endpoints: (builder) => ({
    getStrategies: builder.query<GetStrategiesResponse, GetStrategiesParams>({
      query: () => ({
        url: `/strategies`,
        method: "GET",
      }),
      providesTags: ["strategies"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetStrategiesQuery } = strategiesApi;
