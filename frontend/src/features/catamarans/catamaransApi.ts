// frontend/src/features/catamarans/catamaransApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Catamaran } from "../../types/catamarans";
import type { Rental } from "../../types/rental";

export const catamaransApi = createApi({
  reducerPath: "catamaransApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Catamaran", "Rental"],

  endpoints: (builder) => ({
    // ------------------------------------------------------------
    // A) Админ: получить катамараны конкретного рабочего
    getCatamaransByAdminWorker: builder.query<Catamaran[], number>({
      query: (workerId) => `admin/worker/${workerId}/catamarans`,
      providesTags: (result = [], _err, workerId) => [
        { type: "Catamaran", id: `ADMIN_WORKER_${workerId}` },
        ...result.map((c) => ({ type: "Catamaran" as const, id: c.id })),
      ],
    }),

    // ------------------------------------------------------------
    // 1) Список катамаранов залогиненного рабочего
    getCatamaransForWorker: builder.query<Catamaran[], void>({
      query: () => "worker/catamarans",
      providesTags: (result = []) => [
        { type: "Catamaran", id: "LIST" },
        ...result.map((c) => ({ type: "Catamaran" as const, id: c.id })),
      ],
    }),

    // ------------------------------------------------------------
    // 2) Создать катамаран (админ)
    createCatamaran: builder.mutation<
      Catamaran,
      {
        workerId: number;
        name: string;
        timerLimitMinutes?: number;
        notifyOnStart?: boolean;
      }
    >({
      query: ({ workerId, name, timerLimitMinutes, notifyOnStart }) => ({
        url: `admin/worker/${workerId}/catamarans`,
        method: "POST",
        body: { name, timerLimitMinutes, notifyOnStart },
      }),
      invalidatesTags: (_res, _err, { workerId }) => [
        { type: "Catamaran", id: `ADMIN_WORKER_${workerId}` },
        { type: "Catamaran", id: "LIST" },
      ],
    }),

    // ------------------------------------------------------------
    // 3) Удалить катамаран (админ)
    deleteCatamaran: builder.mutation<
      { deleted: boolean },
      { workerId: number; catamaranId: number }
    >({
      query: ({ workerId, catamaranId }) => ({
        url: `admin/worker/${workerId}/catamarans/${catamaranId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { workerId }) => [
        { type: "Catamaran", id: `ADMIN_WORKER_${workerId}` },
        { type: "Catamaran", id: "LIST" },
      ],
    }),

    // ------------------------------------------------------------
    // 4) Старт проката
    startRental: builder.mutation<
      Rental,
      { catamaranId: number; count: number }
    >({
      query: ({ catamaranId, count }) => ({
        url: `worker/catamarans/${catamaranId}/rentals`,
        method: "POST",
        body: { count },
      }),
      invalidatesTags: (_res, _err, { catamaranId }) => [
        { type: "Rental", id: catamaranId },
      ],
    }),

    // ------------------------------------------------------------
    // 5) Завершение проката
    finishRental: builder.mutation<
      Rental,
      {
        catamaranId: number;
        rentalId: number;
        durationMinutes: number;
        count: number;
      }
    >({
      query: ({ catamaranId, rentalId, durationMinutes, count }) => ({
        url: `worker/catamarans/${catamaranId}/rentals/${rentalId}`,
        method: "PATCH",
        body: { endTime: new Date().toISOString(), durationMinutes, count },
      }),
      invalidatesTags: (_res, _err, { catamaranId }) => [
        { type: "Rental", id: catamaranId },
      ],
    }),

    // ------------------------------------------------------------
    // 6) История прокатов конкретного катамарана
    getRentalsByCatamaran: builder.query<Rental[], number>({
      query: (catamaranId) => `worker/catamarans/${catamaranId}/rentals`,
      providesTags: (_res, _err, catamaranId) => [
        { type: "Rental", id: catamaranId },
      ],
    }),
  }),
});

export const {
  useGetCatamaransByAdminWorkerQuery, // ← для админа
  useGetCatamaransForWorkerQuery, // ← для рабочего
  useCreateCatamaranMutation,
  useDeleteCatamaranMutation,
  useStartRentalMutation,
  useFinishRentalMutation,
  useGetRentalsByCatamaranQuery,
} = catamaransApi;
