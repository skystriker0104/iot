import { create } from 'zustand';
import type { AuthUser, LoginCredentials } from '../lib/types';
import { getCurrentUser, loginApi, logoutApi } from '../lib/api/auth';
import { AUTH_EXPIRED_EVENT } from '../lib/api/client';

interface AuthState {
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const initialUser = getCurrentUser();

export const useAuthStore = create<AuthState>((set) => ({
  authUser: initialUser,
  isAuthenticated: !!initialUser,
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
    void logoutApi();
    set({ authUser: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

// apiClient phát sự kiện này khi refresh token hết hạn / bị thu hồi → quay về màn đăng nhập
window.addEventListener(AUTH_EXPIRED_EVENT, () => {
  useAuthStore.setState({
    authUser: null,
    isAuthenticated: false,
    error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  });
});
