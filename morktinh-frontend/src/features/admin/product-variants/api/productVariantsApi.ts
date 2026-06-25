import { baseApi } from '@/store/baseApi';
import { ProductVariant, VariantOption } from '../types';

export const productVariantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createVariant: builder.mutation<ProductVariant, FormData>({
      query: (data) => ({
        url: 'products/variants/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: Number(arg.get('product')) }],
    }),
    updateVariant: builder.mutation<ProductVariant, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `products/variants/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteVariant: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/variants/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    createVariantOption: builder.mutation<VariantOption, { variant: number; option: number }>({
      query: (data) => ({
        url: 'products/variant-options/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteVariantOption: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/variant-options/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useCreateVariantOptionMutation,
  useDeleteVariantOptionMutation,
} = productVariantsApi;
