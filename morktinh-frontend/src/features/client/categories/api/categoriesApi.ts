import { baseApi } from '@/store/baseApi';
import { Category, CategoriesResponse } from '@/features/client/categories/types';

export const clientCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientCategories: builder.query<Category[], void>({
      query: () => ({
        url: 'products/categories/',
        params: {
          active: true,
          page_size: 100,
        },
      }),
      transformResponse: (response: CategoriesResponse | Category[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.results || [];
      },
      providesTags: ['category'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientCategoriesQuery,
} = clientCategoriesApi;
