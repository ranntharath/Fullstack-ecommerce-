import { baseApi } from '@/store/baseApi';
import { ProductOptionGroup, ProductOption } from '../types';

export const productOptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOptionGroup: builder.mutation<ProductOptionGroup, { product: number; title: string }>({
      query: (data) => ({
        url: 'products/option-groups/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.product }],
    }),
    updateOptionGroup: builder.mutation<ProductOptionGroup, { id: number; data: { title: string } }>({
      query: ({ id, data }) => ({
        url: `products/option-groups/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteOptionGroup: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/option-groups/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    createOption: builder.mutation<ProductOption, { group: number; value: string }>({
      query: (data) => ({
        url: 'products/options/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateOption: builder.mutation<ProductOption, { id: number; data: { value: string } }>({
      query: ({ id, data }) => ({
        url: `products/options/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteOption: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/options/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useCreateOptionGroupMutation,
  useUpdateOptionGroupMutation,
  useDeleteOptionGroupMutation,
  useCreateOptionMutation,
  useUpdateOptionMutation,
  useDeleteOptionMutation,
} = productOptionsApi;
