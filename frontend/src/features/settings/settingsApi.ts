// frontend/src/features/settings/settingsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Setting } from "../../types/setting";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
    prepareHeaders: (headers) => {
      const t = localStorage.getItem("token");
      if (t) headers.set("Authorization", `Bearer ${t}`);
      return headers;
    },
  }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<Setting, void>({
      query: () => "admin/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<Setting, Partial<Setting>>({
      query: (body) => ({
        url: "admin/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
