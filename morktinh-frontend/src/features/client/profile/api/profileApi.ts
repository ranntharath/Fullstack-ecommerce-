import { baseApi } from "@/store/baseApi";
import {
  CustomerAddress,
  CustomerAddressRequest,
  UserProfile,
} from "@/features/client/profile/types";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => "users/profile/me/",
      providesTags: ["customer"],
    }),
    updateProfile: builder.mutation<UserProfile, FormData>({
      query: (data) => ({
        url: "users/profile/me/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["customer", "auth"],
    }),
    getAddresses: builder.query<CustomerAddress[], void>({
      query: () => "users/profile/addresses/",
      providesTags: ["customer"],
    }),
    createAddress: builder.mutation<CustomerAddress, CustomerAddressRequest>({
      query: (data) => ({
        url: "users/profile/addresses/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["customer"],
    }),
    updateAddress: builder.mutation<CustomerAddress, { id: number; data: CustomerAddressRequest }>({
      query: ({ id, data }) => ({
        url: `users/profile/addresses/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["customer"],
    }),
    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({
        url: `users/profile/addresses/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["customer"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = profileApi;
