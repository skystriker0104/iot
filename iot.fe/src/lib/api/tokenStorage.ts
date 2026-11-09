import type { AuthUser } from '../types';

const STORAGE_KEY = 'iot_auth';
// Refresh sớm khi access token còn dưới 30 giây
const EXPIRY_SKEW_MS = 30_000;

export interface TokenResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
}

interface StoredAuth {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  user: AuthUser | null;
}

function read(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function write(value: StoredAuth): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* localStorage bị chặn: phiên chỉ sống trong tab hiện tại */
  }
}

export const tokenStorage = {
  getAccessToken: (): string | null => read()?.accessToken ?? null,
  getRefreshToken: (): string | null => read()?.refreshToken ?? null,
  getUser: (): AuthUser | null => read()?.user ?? null,

  isAccessTokenExpiring(): boolean {
    const expiresAt = read()?.expiresAt;
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() - Date.now() < EXPIRY_SKEW_MS;
  },

  setTokens(tokens: TokenResponse): void {
    write({
      accessToken: tokens.accessToken,
      expiresAt: tokens.expiresAt,
      refreshToken: tokens.refreshToken,
      user: read()?.user ?? null,
    });
  },

  setUser(user: AuthUser): void {
    const current = read();
    if (current) write({ ...current, user });
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('iot_auth_user'); // key cũ của bản mock
    } catch {
      /* ignore */
    }
  },
};
