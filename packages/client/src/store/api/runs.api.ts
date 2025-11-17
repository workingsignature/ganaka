import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import z from "zod";
import { v1_core_strategies_versions_runs_schemas } from "@ganaka/server-schemas";

// Define a service using a base URL and expected endpoints
export const runsAPI = createApi({
  reducerPath: "runsAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["runs", "run"],
  endpoints: (builder) => ({
    getRuns: builder.query<
      z.infer<typeof v1_core_strategies_versions_runs_schemas.getRuns.response>,
      z.infer<typeof v1_core_strategies_versions_runs_schemas.getRuns.params>
    >({
      query: ({ strategyid, versionid }) => ({
        url: `/strategies/${strategyid}/versions/${versionid}/runs`,
        method: "GET",
      }),
      providesTags: ["runs"],
    }),
    getRun: builder.query<
      z.infer<typeof v1_core_strategies_versions_runs_schemas.getRun.response>,
      z.infer<typeof v1_core_strategies_versions_runs_schemas.getRun.params>
    >({
      query: ({ strategyid, versionid, id }) => ({
        url: `/strategies/${strategyid}/versions/${versionid}/runs/${id}`,
        method: "GET",
      }),
      providesTags: ["run"],
    }),
    createRun: builder.mutation<
      z.infer<
        typeof v1_core_strategies_versions_runs_schemas.createRun.response
      >,
      {
        body: z.infer<
          typeof v1_core_strategies_versions_runs_schemas.createRun.body
        >;
        params: z.infer<
          typeof v1_core_strategies_versions_runs_schemas.createRun.params
        >;
      }
    >({
      query: ({ body, params }) => ({
        url: `/strategies/${params.strategyid}/versions/${params.versionid}/runs`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["runs", "run"],
    }),
    updateRun: builder.mutation<
      z.infer<
        typeof v1_core_strategies_versions_runs_schemas.updateRun.response
      >,
      {
        body: z.infer<
          typeof v1_core_strategies_versions_runs_schemas.updateRun.body
        >;
        params: z.infer<
          typeof v1_core_strategies_versions_runs_schemas.updateRun.params
        >;
      }
    >({
      query: ({ body, params }) => ({
        url: `/strategies/${params.strategyid}/versions/${params.versionid}/runs/${params.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["runs", "run"],
    }),
    deleteRun: builder.mutation<
      z.infer<
        typeof v1_core_strategies_versions_runs_schemas.deleteRun.response
      >,
      z.infer<typeof v1_core_strategies_versions_runs_schemas.deleteRun.params>
    >({
      query: ({ strategyid, versionid, id }) => ({
        url: `/strategies/${strategyid}/versions/${versionid}/runs/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["runs"],
    }),
  }),
});
