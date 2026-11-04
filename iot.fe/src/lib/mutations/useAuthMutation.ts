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

  return useMutation<AuthUser, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return await loginApi(credentials);
    },
    onSuccess: (user, variables, context) => {
      useAuthStore.setState({
        authUser: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      // Invalidate toàn bộ cache để nạp dữ liệu phiên mới
      queryClient.invalidateQueries();
      options?.onSuccess?.(user, variables, context);
    },
    onError: (err, variables, context) => {
      useAuthStore.setState({
        isLoading: false,
        error: err.message || 'Đăng nhập thất bại',
      });
      options?.onError?.(err, variables, context);
    },
    ...options,
  });
}

/**
 * Mutation hook đăng xuất tài khoản
 */
export function useLogoutMutation(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await logoutApi();
    },
    onSuccess: (data, variables, context) => {
      useAuthStore.getState().logout();
      // Xóa toàn bộ bộ nhớ đệm truy vấn
      queryClient.clear();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

