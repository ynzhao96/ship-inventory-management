export function getToken() {
  return localStorage.getItem('a-token') ?? '';
}

let isRedirecting = false;

interface HttpResponse<T = any> {
  success: boolean;
  error?: any;
  code?: any;
  data?: T;
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
        data: null,
        message: 'Unauthorized',
      });
    }

    // 尝试解析 JSON
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: json?.message || json?.error || `获取船舶失败(${res.status})`,
        code: json?.code || 'ERROR',
        data: null as any,
      };
    }

    return {
      success: json?.success === true,
      data: json.data,
      message: json?.message || 'OK',
    };
  } catch (err: any) {
    return {
      error: err,
      success: false,
      data: null as any,
      message: err?.message || 'Network error',
    };
  }
}
