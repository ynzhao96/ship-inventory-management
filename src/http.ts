export function getToken() {
  return localStorage.getItem('a-token') ?? '';
}

let isRedirecting = false;

interface HttpResponse<T = any> {
  error?: any;
  success: boolean;
  status: number;
  data: T;
  message?: string;
}

export async function http<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<HttpResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-token': `${getToken()}`,
        ...(options.headers || {}),
      },
    });

    // 未授权 → 跳转登录页
    if (res.status === 401 && !isRedirecting) {
      isRedirecting = true;
      window.location.href = '/login';
      return Promise.reject({
        success: false,
        status: 401,
        data: null,
        message: 'Unauthorized',
      });
    }

    // 尝试解析 JSON
    const data = await res.json().catch(() => ({}));

    return {
      success: res.ok,
      status: res.status,
      data,
      message: (data as any)?.message,
    };
  } catch (err: any) {
    return {
      error: err,
      success: false,
      status: 0,
      data: null as any,
      message: err?.message || 'Network error',
    };
  }
}
