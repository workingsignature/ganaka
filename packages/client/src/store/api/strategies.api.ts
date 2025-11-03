import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import z from "zod";
import { v1_core_strategies_schemas } from "@ganaka/server-schemas";

// Define a service using a base URL and expected endpoints
export const strategiesApi = createApi({
  reducerPath: "strategiesAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["strategies"],
  endpoints: (builder) => ({
    createStrategy: builder.mutation<
      z.infer<typeof v1_core_strategies_schemas.createStrategy.response>,
      z.infer<typeof v1_core_strategies_schemas.createStrategy.body>
    >({
      query: (body) => ({
        url: `/strategies`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["strategies"],
    }),
    getStrategies: builder.query<
      z.infer<typeof v1_core_strategies_schemas.getStrategies.response>,
      void
    >({
      query: () => ({
        url: `/strategies`,
        method: "GET",
      }),
    }),
  }),
});
