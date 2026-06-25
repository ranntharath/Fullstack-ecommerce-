import { baseApi } from '@/store/baseApi';
import {
  ClientProductListFilters,
  ProductListItem,
  ProductsResponse,
  Product,
} from '@/features/client/products/types';

export const clientProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientProducts: builder.query<ProductListItem[], ClientProductListFilters | void>({
      query: (filters) => ({
        url: 'products/products/',
        params: {
          active: true, // clients should only see active products
          page_size: 100,
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.category ? { category: filters.category } : {}),
          ...(filters?.brand ? { brand: filters.brand } : {}),
          ...(filters?.tag ? { tag: filters.tag } : {}),
          ...(filters?.featured !== undefined ? { featured: filters.featured } : {}),
          ...(filters?.in_stock !== undefined ? { in_stock: filters.in_stock } : {}),
          ...(filters?.has_discount !== undefined ? { has_discount: filters.has_discount } : {}),
          ...(filters?.min_price ? { min_price: filters.min_price } : {}),
          ...(filters?.max_price ? { max_price: filters.max_price } : {}),
          ...(filters?.sort ? { sort: filters.sort } : {}),
        },
      }),
      transformResponse: (response: ProductsResponse | ProductListItem[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.results || [];
      },
      providesTags: ['Product'],
    }),
    getClientProduct: builder.query<Product, number>({
      query: (id) => `products/products/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientProductsQuery,
  useGetClientProductQuery,
} = clientProductsApi;
