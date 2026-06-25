import { baseApi } from '@/store/baseApi';
import { BrandsResponse, Brand, CreateBrandRequest } from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export type BrandListFilters = {
  search?: string;
  active?: boolean;
};

export type BrandPageParams = BrandListFilters & {
  page: number;
  pageSize: number;
};

export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<Brand[], BrandListFilters | void>({
      query: (filters) => ({
        url: 'products/brands/',
        params: {
          page_size: 100,
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.active !== undefined ? { active: filters.active } : {}),
        },
      }),
      // If your API returns paginated results { results: [...] }, transform the response:
      transformResponse: (response: BrandsResponse | Brand[]) => {
        if (Array.isArray(response)) {
            return response;
        }
        return response.results;
      },
      providesTags: ['brand'],
    }),
    getBrandsPage: builder.query<PaginatedResponse<Brand>, BrandPageParams>({
      query: ({ page, pageSize, ...filters }) => ({
        url: 'products/brands/',
        params: {
          page,
          page_size: pageSize,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.active !== undefined ? { active: filters.active } : {}),
        },
      }),
      providesTags: ['brand'],
    }),
    createBrand: builder.mutation<Brand, CreateBrandRequest | FormData>({
      query: (credentials) => ({
        url: 'products/brands/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['brand'],
    }),
    updateBrand: builder.mutation<Brand, { id: number; data: FormData | Partial<Brand> }>({
      query: ({ id, data }) => ({
        url: `products/brands/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['brand'],
    }),
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/brands/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['brand'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetBrandsQuery, 
  useGetBrandsPageQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation
} = brandsApi;
