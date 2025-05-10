// frontend/src/features/reports/reportsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ReportResponse } from "../../types/report";

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (b) => ({
    getWorkerReport: b.query<
      ReportResponse,
      {
        workerId: number;
        startDate: string;
        endDate: string;
        catamarans?: string[];
      }
    >({
      query: ({ workerId, startDate, endDate, catamarans }) => ({
        url: `admin/worker/${workerId}/report`,
        params: { startDate, endDate, ...(catamarans ? { catamarans } : {}) },
      }),
    }),
  }),
});

export const { useGetWorkerReportQuery } = reportsApi;
