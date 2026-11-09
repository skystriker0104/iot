import { tokenStorage, type TokenResponse } from './tokenStorage';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5171';

/** Sự kiện phát ra khi phiên đăng nhập không thể làm mới (refresh token hết hạn / bị thu hồi). */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Không kết nối được tới máy chủ. Kiểm tra Backend đã chạy chưa.',
  400: 'Dữ liệu gửi lên không hợp lệ.',
  401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu.',
  409: 'Thiết bị đang xử lý lệnh trước đó, vui lòng chờ vài giây.',
  500: 'Lỗi hệ thống.',
  503: 'Mất kết nối tới MQTT broker.',
  504: 'Thiết bị không phản hồi (ESP mất nguồn hoặc mất WiFi).',
};

// Dùng chung 1 promise để nhiều request cùng gặp 401 chỉ gọi refresh 1 lần
let refreshPromise: Promise<string | null> | null = null;

/**
 * Đổi refresh token lấy access token mới (token rotation).
 * Trả null khi refresh token không còn hợp lệ; ném ApiError(0) khi mất kết nối.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) return null;

      let res: Response;
      try {
        res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        throw new ApiError(0, STATUS_MESSAGES[0]);
      }

      if (!res.ok) return null;

      const tokens = (await res.json()) as TokenResponse;
      tokenStorage.setTokens(tokens);
      return tokens.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** Access token còn hạn (tự refresh trước nếu sắp hết hạn). Dùng cho SignalR. */
export async function getValidAccessToken(): Promise<string | null> {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;
  if (!tokenStorage.isAccessTokenExpiring()) return token;
  return (await refreshAccessToken()) ?? null;
}

function expireSession(): never {
  tokenStorage.clear();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  throw new ApiError(401, STATUS_MESSAGES[401]);
}

async function parseError(res: Response): Promise<ApiError> {
  const fallback = STATUS_MESSAGES[res.status] ?? `Lỗi HTTP ${res.status}`;
  try {
    const body = await res.json();
    // ProblemDetails của BE: { title, status } hoặc lỗi validation { errors: { field: [msg] } }
    const validation = body?.errors ? Object.values(body.errors as Record<string, string[]>).flat()[0] : null;
    const title = typeof body?.title === 'string' && !body.title.startsWith('One or more') ? body.title : null;
    return new ApiError(res.status, validation || title || body?.message || fallback);
  } catch {
    return new ApiError(res.status, fallback);
  }
}

export interface ApiRequestOptions extends RequestInit {
  /** Không gắn token, không tự refresh (dùng cho login/refresh/logout). */
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: ApiRequestOptions = {}, canRetry = true): Promise<T> {
  const { skipAuth, ...init } = options;
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = await getValidAccessToken();
    if (!token) expireSession();
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    throw new ApiError(0, STATUS_MESSAGES[0]);
  }

  if (res.status === 401 && !skipAuth) {
    // Access token bị từ chối: thử refresh 1 lần rồi gửi lại request
    if (canRetry && (await refreshAccessToken())) {
      return apiClient<T>(endpoint, options, false);
    }
    expireSession();
  }

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
