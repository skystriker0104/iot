import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { loginApi, logoutApi } from '../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import type { AuthUser, LoginCredentials } from '../types';

/**
 * Mutation hook đăng nhập tài khoản hệ thống IoT PTIT
 */
export function useLoginMutation(
  options?: UseMutationOptions<AuthUser, Error, LoginCredentials>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await loginApi(credentials);
    },
    ...options,
    onSuccess: (...args) => {
      const [user] = args;
      useAuthStore.setState({
        authUser: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      // Invalidate toàn bộ cache để nạp dữ liệu phiên mới
      queryClient.invalidateQueries();
      (options?.onSuccess as any)?.(...args);
    },
    onError: (...args) => {
      const [err] = args;
      useAuthStore.setState({
        isLoading: false,
        error: err?.message || 'Đăng nhập thất bại',
      });
      (options?.onError as any)?.(...args);
    },
  });
}

/**
 * Mutation hook đăng xuất tài khoản
 */
export function useLogoutMutation(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    ...options,
    onSettled: (...args) => {
      useAuthStore.setState({ authUser: null, isAuthenticated: false, error: null });
      // Xóa toàn bộ bộ nhớ đệm truy vấn
      queryClient.clear();
      (options?.onSettled as any)?.(...args);
    },
  });
}
