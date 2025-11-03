import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import strategyFormSlice from "./forms/strategyFormSlice";
import { shortlistsAPI } from "./api/shortlists.api";
import { setupListeners } from "@reduxjs/toolkit/query";
import { versionsAPI } from "./api/versions.api";
import { strategiesAPI } from "./api/strategies.api";
import versionFormSlice from "./forms/versionFormSlice";
import runFormSlice from "./forms/runFormSlice";

export const store = configureStore({
  reducer: {
    app: appSlice,
    strategyForm: strategyFormSlice,
    versionForm: versionFormSlice,
    runForm: runFormSlice,
    [shortlistsAPI.reducerPath]: shortlistsAPI.reducer,
    [versionsAPI.reducerPath]: versionsAPI.reducer,
    [strategiesAPI.reducerPath]: strategiesAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      shortlistsAPI.middleware,
      versionsAPI.middleware,
      strategiesAPI.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
