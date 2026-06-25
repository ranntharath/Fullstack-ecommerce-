import { baseApi } from "@/store/baseApi";
import {
  AddCartItemRequest,
  CartItem,
  UpdateCartItemRequest,
} from "@/features/client/cart/types";

export const clientCartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCartItems: builder.query<CartItem[], void>({
      query: () => "products/cart-items/",
      providesTags: ["cart"],
    }),
    addCartItem: builder.mutation<CartItem, AddCartItemRequest>({
      query: (body) => ({
        url: "products/cart-items/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cart"],
    }),
    updateCartItem: builder.mutation<CartItem, UpdateCartItemRequest>({
      query: ({ id, quantity }) => ({
        url: `products/cart-items/${id}/`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["cart"],
    }),
    removeCartItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/cart-items/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["cart"],
    }),
    clearCart: builder.mutation<null, CartItem[]>({
      async queryFn(items, _queryApi, _extraOptions, fetchWithBQ) {
        for (const item of items) {
          const result = await fetchWithBQ({
            url: `products/cart-items/${item.id}/`,
            method: "DELETE",
          });

          if (result.error) {
            return { error: result.error };
          }
        }

        return { data: null };
      },
      invalidatesTags: ["cart"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddCartItemMutation,
  useClearCartMutation,
  useGetCartItemsQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} = clientCartApi;
