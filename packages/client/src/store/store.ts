import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import strategyFormSlice from "./forms/strategyFormSlice";
import shortlistFormSlice from "./forms/shortlistFormSlice";
import { shortlistsAPI } from "./api/shortlists.api";
import { setupListeners } from "@reduxjs/toolkit/query";
import { versionsAPI } from "./api/versions.api";
import { strategiesAPI } from "./api/strategies.api";
import { instrumentsAPI } from "./api/instruments.api";
import { runsAPI } from "./api/runs.api";
import versionFormSlice from "./forms/versionFormSlice";
import runFormSlice from "./forms/runFormSlice";
import shortlistsPageSlice from "./pages/shortlistsPageSlice";

export const store = configureStore({
  reducer: {
    app: appSlice,
    shortlistsPage: shortlistsPageSlice,
    strategyForm: strategyFormSlice,
    shortlistForm: shortlistFormSlice,
    versionForm: versionFormSlice,
    runForm: runFormSlice,
    [shortlistsAPI.reducerPath]: shortlistsAPI.reducer,
    [versionsAPI.reducerPath]: versionsAPI.reducer,
    [strategiesAPI.reducerPath]: strategiesAPI.reducer,
    [instrumentsAPI.reducerPath]: instrumentsAPI.reducer,
    [runsAPI.reducerPath]: runsAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      shortlistsAPI.middleware,
      versionsAPI.middleware,
      strategiesAPI.middleware,
      instrumentsAPI.middleware,
      runsAPI.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
