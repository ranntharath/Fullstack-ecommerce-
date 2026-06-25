import { baseApi } from '@/store/baseApi';
import { DashboardData } from '../types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<DashboardData, void>({
      query: () => 'products/admin/dashboard/',
      providesTags: ['order', 'Product', 'customer', 'settings'],
    }),
  }),
});

export const { useGetAdminDashboardQuery } = dashboardApi;
