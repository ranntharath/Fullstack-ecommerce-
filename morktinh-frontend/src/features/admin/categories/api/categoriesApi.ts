import { baseApi } from '@/store/baseApi';
import { CategoriesResponse, Category, CreateCategoryRequest } from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export type CategoryListFilters = {
  search?: string;
  active?: boolean;
};

export type CategoryPageParams = CategoryListFilters & {
  page: number;
  pageSize: number;
};

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], CategoryListFilters | void>({
      query: (filters) => ({
        url: 'products/categories/',
        params: {
          page_size: 100,
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.active !== undefined ? { active: filters.active } : {}),
        },
      }),
      // If your API returns paginated results { results: [...] }, transform the response:
      transformResponse: (response: CategoriesResponse | Category[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.results;
      },
      providesTags: ['category'],
    }),
    getCategoriesPage: builder.query<PaginatedResponse<Category>, CategoryPageParams>({
      query: ({ page, pageSize, ...filters }) => ({
        url: 'products/categories/',
        params: {
          page,
          page_size: pageSize,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.active !== undefined ? { active: filters.active } : {}),
        },
      }),
      providesTags: ['category'],
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest | FormData>({
      query: (credentials) => ({
        url: 'products/categories/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['category'],
    }),
    updateCategory: builder.mutation<Category, { id: number; data: FormData | Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `products/categories/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/categories/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['category'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useGetCategoriesPageQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = categoriesApi;
