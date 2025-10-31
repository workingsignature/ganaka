import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import strategyFormSlice from "./forms/strategyFormSlice";
import { shortlistApi } from "./api/shortlists.api";
import { setupListeners } from "@reduxjs/toolkit/query";
import { versionsApi } from "./api/versions.api";
import { strategiesApi } from "./api/strategies.api";
import versionFormSlice from "./forms/versionFormSlice";
import runFormSlice from "./forms/runFormSlice";

export const store = configureStore({
  reducer: {
    app: appSlice,
    strategyForm: strategyFormSlice,
    versionForm: versionFormSlice,
    runForm: runFormSlice,
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
