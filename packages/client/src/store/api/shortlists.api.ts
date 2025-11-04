import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import { v1_core_shortlists_schemas } from "@ganaka/server-schemas";
import type z from "zod";

export const shortlistsAPI = createApi({
  reducerPath: "shortlistAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["shortlists"],
  endpoints: (builder) => ({
    getShortlists: builder.query<
      z.infer<typeof v1_core_shortlists_schemas.getShortlists.response>,
      void
    >({
      query: () => ({
        url: `/shortlists`,
        method: "GET",
      }),
      providesTags: ["shortlists"],
    }),
    createShortlist: builder.mutation<
      z.infer<typeof v1_core_shortlists_schemas.createShortlist.response>,
      z.infer<typeof v1_core_shortlists_schemas.createShortlist.body>
    >({
      query: (body) => ({
        url: `/shortlists`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["shortlists"],
    }),
    updateShortlist: builder.mutation<
      z.infer<typeof v1_core_shortlists_schemas.updateShortlist.response>,
      {
        params: z.infer<
          typeof v1_core_shortlists_schemas.updateShortlist.params
        >;
        body: z.infer<typeof v1_core_shortlists_schemas.updateShortlist.body>;
      }
    >({
      query: ({ params, body }) => ({
        url: `/shortlists/${params.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["shortlists"],
    }),
    deleteShortlist: builder.mutation<
      z.infer<typeof v1_core_shortlists_schemas.deleteShortlist.response>,
      void
    >({
      query: () => ({
        url: `/shortlists`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["shortlists"],
    }),
    getShortlist: builder.query<
      z.infer<typeof v1_core_shortlists_schemas.getShortlist.response>,
      z.infer<typeof v1_core_shortlists_schemas.getShortlist.params>
    >({
      query: (params) => ({
        url: `/shortlists/${params.id}`,
        method: "GET",
      }),
    }),
  }),
});
