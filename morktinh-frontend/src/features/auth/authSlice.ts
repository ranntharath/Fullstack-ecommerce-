import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from "@/features/auth/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth: (
      state,
      action: PayloadAction<{ user: User | null; accessToken: string | null }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = !!accessToken;
      state.isHydrated = true;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isHydrated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isHydrated = true;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      state.isHydrated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', action.payload);
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { hydrateAuth, setCredentials, logout, setAccessToken, updateUser } = authSlice.actions;

export default authSlice.reducer;
