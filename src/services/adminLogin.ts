// 管理员登录接口
export const adminLogin = async (username: string, password: string) => {
  const res = await fetch('/api/adminLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401 / 404 / 500 等都走这里
    return {
      success: false,
      error: json?.message || json?.error || `登录失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    data: json?.data,
    message: json?.message || '登录成功',
  };
};