import { baseApi } from '@/store/baseApi';
import { DiscountsResponse, Discount, CreateDiscountRequest } from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export type DiscountPageParams = {
  page: number;
  pageSize: number;
};

export const discountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscounts: builder.query<Discount[], void>({
      query: () => ({ url: 'products/discounts/', params: { page_size: 100 } }),
      transformResponse: (response: DiscountsResponse | Discount[]) => {
        if (Array.isArray(response)) {
            return response;
        }
        return response.results;
      },
      providesTags: ['discount'],
    }),
    getDiscountsPage: builder.query<PaginatedResponse<Discount>, DiscountPageParams>({
      query: ({ page, pageSize }) => ({
        url: 'products/discounts/',
        params: { page, page_size: pageSize },
      }),
      providesTags: ['discount'],
    }),
    createDiscount: builder.mutation<Discount, CreateDiscountRequest>({
      query: (data) => ({
        url: 'products/discounts/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['discount'],
    }),
    updateDiscount: builder.mutation<Discount, { id: number; data: Partial<Discount> }>({
      query: ({ id, data }) => ({
        url: `products/discounts/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['discount'],
    }),
    deleteDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/discounts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['discount'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetDiscountsQuery, 
  useGetDiscountsPageQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation
} = discountsApi;
