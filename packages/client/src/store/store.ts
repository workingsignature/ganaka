import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import { shortlistApi } from "./api/shortlist.api";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    app: appSlice,
    [shortlistApi.reducerPath]: shortlistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shortlistApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
