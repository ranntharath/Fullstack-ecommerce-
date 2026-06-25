import { baseApi } from '@/store/baseApi';
import { Banner, BannersResponse } from '@/features/client/banners/types';

export const clientBannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientBanners: builder.query<Banner[], void>({
      query: () => 'products/banners/',
      transformResponse: (response: BannersResponse | Banner[]) => {
        const banners = Array.isArray(response) ? response : (response.results || []);
        // Only return active banners for clients
        return banners.filter(b => b.is_active);
      },
      providesTags: ['banner'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientBannersQuery,
} = clientBannersApi;
