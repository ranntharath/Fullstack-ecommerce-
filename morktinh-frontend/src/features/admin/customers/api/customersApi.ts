import { baseApi } from "@/store/baseApi";
import type { AdminCustomer, CustomerFormValues } from "../types";
import type { PaginatedResponse } from "@/types/pagination";

export type CustomerListParams = {
  search?: string;
  is_active?: boolean;
  is_email_verified?: boolean;
};

export type CustomerPageParams = CustomerListParams & {
  page: number;
  pageSize: number;
};

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<AdminCustomer[], CustomerListParams | void>({
      query: (params) => ({
        url: "users/management/customers/",
        params: { ...(params || {}), page_size: 100 },
      }),
      transformResponse: (response: PaginatedResponse<AdminCustomer> | AdminCustomer[]) => {
        if (Array.isArray(response)) return response;
        return response.results;
      },
      providesTags: (result) => result
        ? [
            ...result.map((customer) => ({ type: "customer" as const, id: customer.id })),
            { type: "customer", id: "LIST" },
          ]
        : [{ type: "customer", id: "LIST" }],
    }),
    getCustomersPage: builder.query<PaginatedResponse<AdminCustomer>, CustomerPageParams>({
      query: ({ page, pageSize, ...params }) => ({
        url: "users/management/customers/",
        params: {
          page,
          page_size: pageSize,
          ...params,
        },
      }),
      providesTags: (result) => result
        ? [
            ...result.results.map((customer) => ({ type: "customer" as const, id: customer.id })),
            { type: "customer", id: "LIST" },
          ]
        : [{ type: "customer", id: "LIST" }],
    }),
    createCustomer: builder.mutation<AdminCustomer, CustomerFormValues>({
      query: (body) => ({
        url: "users/management/customers/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "customer", id: "LIST" }],
    }),
    updateCustomer: builder.mutation<AdminCustomer, { id: number; body: Partial<CustomerFormValues> }>({
      query: ({ id, body }) => ({
        url: `users/management/customers/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "customer", id },
        { type: "customer", id: "LIST" },
      ],
    }),
    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({
        url: `users/management/customers/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "customer", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomersPageQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
