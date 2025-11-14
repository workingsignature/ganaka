import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";
import { v1_core_instruments_schemas } from "@ganaka/server-schemas";
import type z from "zod";

export const instrumentsAPI = createApi({
  reducerPath: "instrumentsAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["instruments", "filter-tree"],
  endpoints: (builder) => ({
    getInstruments: builder.query<
      z.infer<typeof v1_core_instruments_schemas.getInstruments.response>,
      z.infer<typeof v1_core_instruments_schemas.getInstruments.query>
    >({
      query: (params) => ({
        url: `/instruments`,
        method: "GET",
        params,
      }),
      providesTags: ["instruments"],
    }),
    getInstrument: builder.query<
      z.infer<typeof v1_core_instruments_schemas.getInstrument.response>,
      z.infer<typeof v1_core_instruments_schemas.getInstrument.params>
    >({
      query: (params) => ({
        url: `/instruments/${params.id}`,
        method: "GET",
      }),
      providesTags: ["instruments"],
    }),
    getInstrumentsFilterTree: builder.query<
      z.infer<
        typeof v1_core_instruments_schemas.getInstrumentsFilterTree.response
      >,
      void
    >({
      query: () => ({
        url: `/instruments/filter-tree`,
        method: "GET",
      }),
      providesTags: ["filter-tree"],
    }),
  }),
});

export const {
  useGetInstrumentsQuery,
  useGetInstrumentQuery,
  useGetInstrumentsFilterTreeQuery,
} = instrumentsAPI;
