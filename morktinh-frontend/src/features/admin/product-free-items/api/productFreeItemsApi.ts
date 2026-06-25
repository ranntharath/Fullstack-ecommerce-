import { baseApi } from '@/store/baseApi';
import { ProductFreeItem } from '../types';

export const productFreeItemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProductFreeItem: builder.mutation<ProductFreeItem, FormData>({
      query: (data) => ({
        url: 'products/free-items/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: Number(arg.get('product')) }],
    }),
    updateProductFreeItem: builder.mutation<ProductFreeItem, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `products/free-items/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProductFreeItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/free-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useCreateProductFreeItemMutation,
  useUpdateProductFreeItemMutation,
  useDeleteProductFreeItemMutation,
} = productFreeItemsApi;
