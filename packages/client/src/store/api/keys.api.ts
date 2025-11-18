import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import { v1_core_keys_schemas } from "@ganaka/server-schemas";
import type z from "zod";

export const keysApi = createApi({
  reducerPath: "keysAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["keys"],
  endpoints: (builder) => ({
    getKeys: builder.query<
      z.infer<typeof v1_core_keys_schemas.getKeys.response>,
      void
    >({
      query: () => ({
        url: `/keys`,
        method: "GET",
      }),
      providesTags: ["keys"],
    }),
    createKey: builder.mutation<
      z.infer<typeof v1_core_keys_schemas.createKey.response>,
      z.infer<typeof v1_core_keys_schemas.createKey.body>
    >({
      query: (body) => ({
        url: `/keys`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["keys"],
    }),
    deactivateKey: builder.mutation<
      z.infer<typeof v1_core_keys_schemas.deactivateKey.response>,
      z.infer<typeof v1_core_keys_schemas.deactivateKey.params>
    >({
      query: (params) => ({
        url: `/keys/${params.id}/deactivate`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: ["keys"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetKeysQuery,
  useCreateKeyMutation,
  useDeactivateKeyMutation,
} = keysApi;
