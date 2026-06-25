import { baseApi } from '@/store/baseApi';
import { ProductMedia } from '../types';

export const productMediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProductMedia: builder.mutation<ProductMedia, FormData>({
      query: (data) => ({
        url: 'products/product-medias/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: Number(arg.get('product')) }],
    }),
    deleteProductMedia: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/product-medias/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useCreateProductMediaMutation,
  useDeleteProductMediaMutation,
} = productMediaApi;
