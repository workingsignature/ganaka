import { fetchBaseQuery, type BaseQueryFn } from "@reduxjs/toolkit/query/react";

// Declare Clerk on window object
declare global {
  interface Window {
    Clerk: {
      session: {
        getToken(): Promise<string | null>;
      };
    };
  }
}

// Token cache to avoid calling getToken() on every request
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const getCachedToken = async (): Promise<string | null> => {
  const now = Date.now();

  // If we have a cached token and it's not expired, return it
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    // Get fresh token from Clerk
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        cachedToken = token;
        // Cache for 5 minutes (tokens usually last longer, but this is safe)
        tokenExpiry = now + 5 * 60 * 1000;
        return token;
      }
    }
  } catch (error) {
    console.warn("Failed to get Clerk token:", error);
  }

  return null;
};

// Custom base query that handles token caching
export const baseQueryWithAuth: BaseQueryFn = async (
  args,
  api,
  extraOptions
) => {
  const token = await getCachedToken();
  const result = await fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  })(args, api, extraOptions);

  return result;
};
