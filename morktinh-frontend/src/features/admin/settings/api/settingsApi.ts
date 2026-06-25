import { baseApi } from "@/store/baseApi";
import type {
  AdminStoreSettings,
  UpdateAdminStoreSettingsRequest,
} from "../types";

export const adminSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSettings: builder.query<AdminStoreSettings, void>({
      query: () => "products/admin/settings/",
      providesTags: ["settings"],
    }),
    updateAdminSettings: builder.mutation<
      AdminStoreSettings,
      UpdateAdminStoreSettingsRequest
    >({
      query: (body) => ({
        url: "products/admin/settings/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["settings", "Product", "order"],
    }),
    sendTestAlert: builder.mutation<{ sent: number; alert_email: string }, void>({
      query: () => ({
        url: "products/admin/settings/test-alert/",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useSendTestAlertMutation,
} = adminSettingsApi;
