import { baseApi } from "@/store/baseApi";
import {
  CreateOrderRequest,
  KHQRPaymentResponse,
  KHQRPaymentStatusResponse,
  Order,
} from "@/features/client/order/types";

export const clientOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({
        url: "products/orders/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cart", "order", "customer"],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => "products/orders/",
      providesTags: ["order"],
    }),
    createKHQRPayment: builder.mutation<KHQRPaymentResponse, { orderId: number; refresh?: boolean }>({
      query: ({ orderId, refresh = false }) => ({
        url: `products/khqr/${orderId}/`,
        method: "POST",
        body: { refresh },
      }),
    }),
    getKHQRPaymentStatus: builder.query<KHQRPaymentStatusResponse, number>({
      query: (orderId) => `products/khqr/${orderId}/status/`,
      providesTags: ["order"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useCreateKHQRPaymentMutation,
  useGetKHQRPaymentStatusQuery,
  useGetOrdersQuery,
} = clientOrderApi;
