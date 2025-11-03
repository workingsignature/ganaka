import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import z from "zod";
import { v1_core_strategies_versions_schemas } from "@ganaka/server-schemas";

// Define a service using a base URL and expected endpoints
export const versionsAPI = createApi({
  reducerPath: "versionsAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["versions", "version"],
  endpoints: (builder) => ({
    getVersions: builder.query<
      z.infer<typeof v1_core_strategies_versions_schemas.getVersions.response>,
      z.infer<typeof v1_core_strategies_versions_schemas.getVersions.params>
    >({
      query: ({ strategyid }) => ({
        url: `/strategies/${strategyid}/versions`,
        method: "GET",
        params: { strategyid },
      }),
      providesTags: ["versions"],
    }),
    createVersion: builder.mutation<
      z.infer<
        typeof v1_core_strategies_versions_schemas.createVersion.response
      >,
      {
        body: z.infer<
          typeof v1_core_strategies_versions_schemas.createVersion.body
        >;
        params: z.infer<
          typeof v1_core_strategies_versions_schemas.createVersion.params
        >;
      }
    >({
      query: ({ body, params }) => ({
        url: `/strategies/${params.strategyid}/versions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["versions", "version"],
    }),
    updateVersion: builder.mutation<
      z.infer<
        typeof v1_core_strategies_versions_schemas.updateVersion.response
      >,
      {
        body: z.infer<
          typeof v1_core_strategies_versions_schemas.updateVersion.body
        >;
        params: z.infer<
          typeof v1_core_strategies_versions_schemas.updateVersion.params
        >;
      }
    >({
      query: ({ body, params }) => ({
        url: `/strategies/${params.strategyid}/versions/${params.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["versions", "version"],
    }),
    deleteVersion: builder.mutation<
      z.infer<
        typeof v1_core_strategies_versions_schemas.deleteVersion.response
      >,
      z.infer<typeof v1_core_strategies_versions_schemas.deleteVersion.params>
    >({
      query: (params) => ({
        url: `/strategies/${params.strategyid}/versions/${params.id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["versions"],
    }),
    getVersion: builder.query<
      z.infer<typeof v1_core_strategies_versions_schemas.getVersion.response>,
      z.infer<typeof v1_core_strategies_versions_schemas.getVersion.params>
    >({
      query: (params) => ({
        url: `/strategies/${params.strategyid}/versions/${params.id}`,
        method: "GET",
      }),
      providesTags: ["version"],
    }),
  }),
});
