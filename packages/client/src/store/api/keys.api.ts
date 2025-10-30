import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";

// Define types for your API
export interface ShortlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  // Add other properties as needed
}

export interface GetKeysResponse {
  data: ShortlistItem[];
  success: boolean;
  message?: string;
}

// Define a service using a base URL and expected endpoints
export const keysApi = createApi({
  reducerPath: "keysAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["keys"],
  endpoints: (builder) => ({
    getKeys: builder.query<GetKeysResponse, void>({
      query: () => ({
        url: `/keys`,
        method: "GET",
      }),
      providesTags: ["keys"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetKeysQuery } = keysApi;
