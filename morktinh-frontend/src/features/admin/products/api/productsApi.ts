import { baseApi } from '@/store/baseApi';
import {
  Product,
  ProductListItem,
  CreateProductRequest,
} from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export type ProductListFilters = {
  search?: string;
  category?: string;
  brand?: string;
};

export type ProductPageParams = ProductListFilters & {
  page: number;
  pageSize: number;
};

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListItem[], ProductListFilters | void>({
      query: (filters) => ({
        url: 'products/products/',
        params: {
          page_size: 100,
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.category ? { category: filters.category } : {}),
          ...(filters?.brand ? { brand: filters.brand } : {}),
        },
      }),
      transformResponse: (response: PaginatedResponse<ProductListItem> | ProductListItem[]) => {
        if (Array.isArray(response)) return response;
        return response.results;
      },
      providesTags: ['Product'],
    }),
    getProductsPage: builder.query<PaginatedResponse<ProductListItem>, ProductPageParams>({
      query: ({ page, pageSize, ...filters }) => ({
        url: 'products/products/',
        params: {
          page,
          page_size: pageSize,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.brand ? { brand: filters.brand } : {}),
        },
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, number>({
      query: (id) => `products/products/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (data) => ({
        url: 'products/products/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: number; data: Partial<CreateProductRequest> }>({
      query: ({ id, data }) => ({
        url: `products/products/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/products/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsPageQuery,
  useGetProductQuery,
  useLazyGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
