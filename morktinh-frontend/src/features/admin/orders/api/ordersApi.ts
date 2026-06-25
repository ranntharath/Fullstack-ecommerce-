import { baseApi } from '@/store/baseApi';
import { AdminCustomer, AdminOrder, CreateAdminOrderRequest, OrderStatus, PaginatedAdminOrders, PaymentMethod } from '../types';

export interface AdminOrderQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
}

export const adminOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCustomers: builder.query<AdminCustomer[], void>({
      query: () => 'users/management/customers/',
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        return response.results || [];
      },
      providesTags: ['customer'],
    }),
    getAdminOrders: builder.query<PaginatedAdminOrders, AdminOrderQuery>({
      query: ({ page, pageSize, search, status, paymentMethod }) => ({
        url: 'products/admin/orders/',
        params: {
          page,
          page_size: pageSize,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        },
      }),
      keepUnusedDataFor: 120,
      providesTags: (result) => result
        ? [
            ...result.results.map((order) => ({ type: 'order' as const, id: order.id })),
            { type: 'order', id: 'LIST' },
          ]
        : [{ type: 'order', id: 'LIST' }],
    }),
    updateAdminOrderStatus: builder.mutation<AdminOrder, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `products/admin/orders/${id}/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'order', id },
        { type: 'order', id: 'LIST' },
      ],
    }),
    createAdminOrder: builder.mutation<AdminOrder, CreateAdminOrderRequest>({
      query: (body) => ({
        url: 'products/admin/orders/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'order', id: 'LIST' }, 'Product'],
    }),
  }),
});

export const {
  useGetAdminCustomersQuery,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useCreateAdminOrderMutation,
} = adminOrdersApi;
