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

export interface GetShortlistParams {
  botId: string;
}

export interface GetShortlistResponse {
  data: ShortlistItem[];
  success: boolean;
  message?: string;
}

// Define a service using a base URL and expected endpoints
export const shortlistApi = createApi({
  reducerPath: "shortlistAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["shortlist"],
  endpoints: (builder) => ({
    getShortlist: builder.query<GetShortlistResponse, GetShortlistParams>({
      query: ({ botId }) => ({
        url: `/shortlist`,
        method: "GET",
        params: { botId },
      }),
      providesTags: ["shortlist"],
    }),
  }),
});
