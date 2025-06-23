import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Comment } from "../../types/comment";

export const commentsApi = createApi({
  reducerPath: "commentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    createComment: builder.mutation<
      Comment,
      { catamaranId: number; rentalId: number; text: string }
    >({
      query: ({ catamaranId, rentalId, text }) => ({
        url: `worker/catamarans/${catamaranId}/rentals/${rentalId}/comments`,
        method: "POST",
        body: { text },
      }),
    }),
  }),
});

export const { useCreateCommentMutation } = commentsApi;
