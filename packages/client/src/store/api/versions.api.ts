import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";

// Define types for your API
export interface VersionItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  // Add other properties as needed
}

export interface GetVersionsParams {
  strategyid: string;
}

export interface GetVersionsResponse {
  data: VersionItem[];
  success: boolean;
  message?: string;
}

// Define a service using a base URL and expected endpoints
export const versionsApi = createApi({
  reducerPath: "versionsAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["versions"],
  endpoints: (builder) => ({
    getVersions: builder.query<GetVersionsResponse, GetVersionsParams>({
      query: ({ strategyid }) => ({
        url: `/strategies/:strategyid/versions`,
        method: "GET",
        params: { strategyid },
      }),
      providesTags: ["versions"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetVersionsQuery } = versionsApi;
