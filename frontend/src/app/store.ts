import { configureStore } from "@reduxjs/toolkit";
import { catamaransApi } from "../features/catamarans/catamaransApi";
import { commentsApi } from "../features/comments/commentsApi";
import { settingsApi } from "../features/settings/settingsApi";
import { reportsApi } from "../features/reports/reportsApi";

export const store = configureStore({
  reducer: {
    [catamaransApi.reducerPath]: catamaransApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(catamaransApi.middleware)
      .concat(commentsApi.middleware)
      .concat(settingsApi.middleware)
      .concat(reportsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
