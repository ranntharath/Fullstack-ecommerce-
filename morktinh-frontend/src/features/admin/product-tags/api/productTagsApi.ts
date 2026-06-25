import { baseApi } from '@/store/baseApi';
import { CreateProductTagRequest, ProductTag, ProductTagsResponse } from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export type ProductTagPageParams = {
  page: number;
  pageSize: number;
};

export const productTagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductTags: builder.query<ProductTag[], void>({
      query: () => ({ url: 'products/tags/', params: { page_size: 100 } }),
      transformResponse: (response: ProductTagsResponse | ProductTag[]) => {
        if (Array.isArray(response)) {
          return response;
        }

        return response.results || [];
      },
      providesTags: ['productTag'],
    }),
    getProductTagsPage: builder.query<PaginatedResponse<ProductTag>, ProductTagPageParams>({
      query: ({ page, pageSize }) => ({
        url: 'products/tags/',
        params: { page, page_size: pageSize },
      }),
      providesTags: ['productTag'],
    }),
    createProductTag: builder.mutation<ProductTag, CreateProductTagRequest>({
      query: (data) => ({
        url: 'products/tags/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['productTag'],
    }),
    updateProductTag: builder.mutation<ProductTag, { id: number; data: Partial<CreateProductTagRequest> }>({
      query: ({ id, data }) => ({
        url: `products/tags/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['productTag', 'Product'],
    }),
    deleteProductTag: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/tags/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['productTag', 'Product'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductTagsQuery,
  useGetProductTagsPageQuery,
  useCreateProductTagMutation,
  useUpdateProductTagMutation,
  useDeleteProductTagMutation,
} = productTagsApi;
