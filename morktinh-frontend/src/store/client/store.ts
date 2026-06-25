import { configureStore } from '@reduxjs/toolkit'
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '@/features/auth/authSlice'
import { baseApi } from '../baseApi'

export const clientStore = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof clientStore.getState>;
export type AppDispatch = typeof clientStore.dispatch;

setupListeners(clientStore.dispatch)