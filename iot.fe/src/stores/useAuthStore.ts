import { create } from 'zustand';
import type { AuthUser, LoginCredentials } from '../lib/types';
import { getCurrentUser, loginApi, logoutApi } from '../lib/api/auth';

interface AuthState {
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: getCurrentUser(),
  isAuthenticated: !!getCurrentUser(),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginApi(credentials);
      set({ authUser: user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Đăng nhập thất bại' });
      return false;
    }
  },

  logout: () => {
    logoutApi();
    set({ authUser: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null })
}));
