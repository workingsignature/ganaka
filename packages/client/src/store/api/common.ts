import type { apiErrorResponseSchema } from "@ganaka/server-schemas";
import { notifications } from "@mantine/notifications";
import { fetchBaseQuery, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type z from "zod";

// Declare Clerk on window object
declare global {
  interface Window {
    Clerk: {
      session: {
        getToken(options?: { skipCache?: boolean }): Promise<string | null>;
      };
    };
  }
}

/**
 * Get fresh token from Clerk
 * Clerk's getToken() already handles caching and automatic refresh internally
 */
const getClerkToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    if (window.Clerk && window.Clerk.session) {
      // skipCache forces Clerk to fetch a fresh token
      const token = await window.Clerk.session.getToken({
        skipCache: forceRefresh,
      });
      return token;
    }
  } catch (error) {
    console.warn("Failed to get Clerk token:", error);
  }

  return null;
};

/**
 * Custom base query that handles token refresh and automatic retry on 401 errors
 */
export const baseQueryWithAuth: BaseQueryFn = async (
  args,
  api,
  extraOptions
) => {
  // Get token from Clerk (uses Clerk's internal cache)
  const token = await getClerkToken();

  // Execute the request
  const result = await fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_DOMAIN}/v1/core`,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  })(args, api, extraOptions);

  // Handle 401 errors by retrying with a fresh token
  if (result.error && result.error.status === 401) {
    console.log("Token expired, fetching fresh token and retrying...");

    // Force refresh the token from Clerk
    const freshToken = await getClerkToken(true);

    if (freshToken) {
      // Retry the request with the fresh token
      const retryResult = await fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_DOMAIN}/v1/core`,
        prepareHeaders: (headers) => {
          headers.set("Authorization", `Bearer ${freshToken}`);
          headers.set("Content-Type", "application/json");
          return headers;
        },
      })(args, api, extraOptions);

      // If retry succeeds, return the result
      if (!retryResult.error) {
        return retryResult;
      }

      // If retry also fails, show error
      if (retryResult.error) {
        const errorData = retryResult.error.data as z.infer<
          typeof apiErrorResponseSchema
        >;
        notifications.show({
          title: "Authentication Error",
          message:
            errorData.message ||
            "Your session has expired. Please refresh the page.",
          color: "red",
        });
      }

      return retryResult;
    }
  }

  // Handle other errors
  if (result.error && result.error.status !== 401) {
    const errorData = result.error.data as z.infer<
      typeof apiErrorResponseSchema
    >;
    notifications.show({
      title: "Error",
      message: errorData.message,
      color: "red",
    });
  }

  return result;
};
