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
      providesTags: ["strategies"],
    }),
    getStrategy: builder.query<
      z.infer<typeof v1_core_strategies_schemas.getStrategy.response>,
      z.infer<typeof v1_core_strategies_schemas.getStrategy.params>
    >({
      query: (params) => ({
        url: `/strategies/${params.id}`,
        method: "GET",
      }),
    }),
    deleteStrategy: builder.mutation<
      z.infer<typeof v1_core_strategies_schemas.deleteStrategy.response>,
      z.infer<typeof v1_core_strategies_schemas.deleteStrategy.params>
    >({
      query: (params) => ({
        url: `/strategies/${params.id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["strategies"],
    }),
    updateStrategy: builder.mutation<
      z.infer<typeof v1_core_strategies_schemas.updateStrategy.response>,
      {
        params: z.infer<
          typeof v1_core_strategies_schemas.updateStrategy.params
        >;
        body: z.infer<typeof v1_core_strategies_schemas.updateStrategy.body>;
      }
    >({
      query: ({ params, body }) => ({
        url: `/strategies/${params.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["strategies"],
    }),
  }),
});
