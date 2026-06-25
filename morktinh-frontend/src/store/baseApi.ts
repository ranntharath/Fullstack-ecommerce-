import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setAccessToken } from "@/features/auth/authSlice";

type RefreshResponse = {
    access: string;
};

function isReadRequest(args: string | FetchArgs) {
    if (typeof args === 'string') {
        return true;
    }

    return !args.method || args.method.toUpperCase() === 'GET';
}

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
        if (typeof window === 'undefined') {
            return headers;
        }

        const token = localStorage.getItem('access_token')
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
});

const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401 && typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            api.dispatch(logout());
            return result;
        }

        const refreshResult = await rawBaseQuery(
            {
                url: 'users/auth/token/refresh/',
                method: 'POST',
                body: { refresh: refreshToken },
            },
            api,
            extraOptions
        );

        if (refreshResult.data && typeof refreshResult.data === 'object' && 'access' in refreshResult.data) {
            const { access } = refreshResult.data as RefreshResponse;
            api.dispatch(setAccessToken(access));
            result = await rawBaseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());

            if (isReadRequest(args)) {
                result = await rawBaseQuery(args, api, extraOptions);
            }
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithRefresh,
    endpoints: () => ({}),
    tagTypes: ['auth', 'Product', 'category', 'brand', 'order', 'shipping', 'blog', 'media', 'customer', 'banner', 'discount', 'productTag', 'cart', 'settings']
})
