import { baseApi } from "@/store/baseApi";
import type { PublicStoreSettings } from "../types";

export const clientSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSettings: builder.query<PublicStoreSettings, void>({
      query: () => "products/settings/",
      providesTags: ["settings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPublicSettingsQuery } = clientSettingsApi;
