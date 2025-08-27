import { getToken } from "../http";
// 更新用户账号密码信息
export const updateUserInfo = async (shipId: string, username?: string, password?: string) => {
  // 只把有值的字段放进 body
  const body: any = { shipId };
  if (username !== undefined) body.username = username;
  if (password !== undefined) body.password = password;

  const token = getToken();
  const res = await fetch('/api/updateUserInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
    body: JSON.stringify(body),
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    return {
      success: false,
      error: json?.message || json?.error || `保存失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    // 后端成功返回形如 { success, code, message, data: {...} }
    // 为与 adminLogin 一致，这里将 data 映射为 user
    data: json?.data,
    message: json?.message || '保存成功',
  };
};