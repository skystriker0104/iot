import type { AuthUser, LoginCredentials } from '../types';
import { apiClient, API_BASE } from './client';
import { tokenStorage, type TokenResponse } from './tokenStorage';
import { fetchProfileApi } from './profile';
import { signalRService } from '../signalr/signalrService';

// POST /api/auth/login → lưu access + refresh token → lấy hồ sơ người dùng
export async function loginApi({ username, password }: LoginCredentials): Promise<AuthUser> {
  const tokens = await apiClient<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: username.trim(), password }),
    skipAuth: true,
  });
  tokenStorage.setTokens(tokens);

  try {
    const profile = await fetchProfileApi();
    const user: AuthUser = {
      id: profile.id,
      username: profile.username,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    };
    tokenStorage.setUser(user);
    return user;
  } catch (err) {
    tokenStorage.clear();
    throw err;
  }
}

// Thu hồi refresh token ở BE (không chặn đăng xuất nếu BE lỗi)
export async function logoutApi(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  tokenStorage.clear();
  await signalRService.stop();

  if (!refreshToken) return;
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    /* BE không chạy: token sẽ tự hết hạn */
  }
}

// Phiên còn lưu trong localStorage (access token hết hạn sẽ được refresh ở request đầu tiên)
export function getCurrentUser(): AuthUser | null {
  return tokenStorage.getRefreshToken() ? tokenStorage.getUser() : null;
}
