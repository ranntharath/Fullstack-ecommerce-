import { baseApi } from '@/store/baseApi';
import { BannersResponse, Banner, CreateBannerRequest } from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export type BannerPageParams = {
  page: number;
  pageSize: number;
};

export const bannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => ({ url: 'products/banners/', params: { page_size: 100 } }),
      transformResponse: (response: BannersResponse | Banner[]) => {
        if (Array.isArray(response)) {
            return response;
        }
        return response.results;
      },
      providesTags: ['banner'],
    }),
    getBannersPage: builder.query<PaginatedResponse<Banner>, BannerPageParams>({
      query: ({ page, pageSize }) => ({
        url: 'products/banners/',
        params: { page, page_size: pageSize },
      }),
      providesTags: ['banner'],
    }),
    createBanner: builder.mutation<Banner, CreateBannerRequest | FormData>({
      query: (credentials) => ({
        url: 'products/banners/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['banner'],
    }),
    updateBanner: builder.mutation<Banner, { id: number; data: FormData | Partial<Banner> }>({
      query: ({ id, data }) => ({
        url: `products/banners/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['banner'],
    }),
    deleteBanner: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/banners/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['banner'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetBannersQuery, 
  useGetBannersPageQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation
} = bannersApi;
