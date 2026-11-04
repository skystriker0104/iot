const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5171';

export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('iot_auth_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.token || null;
  } catch {
    return null;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const rawText = await res.text();
    let errorMsg = `HTTP Error ${res.status}`;

    if (rawText) {
      try {
        const errJson = JSON.parse(rawText);
        errorMsg = errJson.message || errJson.title || errJson.detail || rawText;
      } catch {
        errorMsg = rawText;
      }
    }

    // Nếu token cũ / hết hạn (HTTP 401 Unauthorized), xóa token và làm mới trang để đăng nhập lại
    if (res.status === 401) {
      localStorage.removeItem('iot_auth_user');
      errorMsg = 'Phiên làm việc cũ đã hết hạn. Vui lòng đăng nhập lại với mật khẩu Admin@123.';
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const responseText = await res.text();
  return responseText ? (JSON.parse(responseText) as T) : ({} as T);
}
