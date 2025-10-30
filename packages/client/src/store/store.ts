import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import { shortlistApi } from "./api/shortlists.api";
import { setupListeners } from "@reduxjs/toolkit/query";
import { versionsApi } from "./api/versions.api";
import { strategiesApi } from "./api/strategies.api";

export const store = configureStore({
  reducer: {
    app: appSlice,
    [shortlistApi.reducerPath]: shortlistApi.reducer,
    [versionsApi.reducerPath]: versionsApi.reducer,
    [strategiesApi.reducerPath]: strategiesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      shortlistApi.middleware,
      versionsApi.middleware,
      strategiesApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
