// 管理员登录接口
export const adminLogin = async (username: string, password: string) => {
  const res = await fetch('/api/adminLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  let data: any = {};
  try { data = await res.json(); } catch { }

  if (!res.ok) {
    // 401 / 404 / 500 等都走这里
    return {
      success: false,
      error: data?.message || data?.error || `登录失败(${res.status})`,
      code: data?.code || 'ERROR',
    };
  }

  return {
    success: data?.success === true,
    user: data?.user,
    message: data?.message || '登录成功',
  };
};