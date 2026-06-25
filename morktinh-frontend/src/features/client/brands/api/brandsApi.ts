import { baseApi } from '@/store/baseApi';
import { Brand, BrandsResponse } from '@/features/client/brands/types';

export const clientBrandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientBrands: builder.query<Brand[], void>({
      query: () => ({
        url: 'products/brands/',
        params: {
          active: true,
          page_size: 100,
        },
      }),
      transformResponse: (response: BrandsResponse | Brand[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.results || [];
      },
      providesTags: ['brand'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientBrandsQuery,
} = clientBrandsApi;
