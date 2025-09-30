import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./common";

// Define a service using a base URL and expected endpoints
export const shortlistApi = createApi({
  reducerPath: "shortlistAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: () => ({}),
});
