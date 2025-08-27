import { getToken } from "../http";
// 获取用户账户密码信息
export const getUserInfo = async (shipId?: string) => {
  const token = getToken();
  const res = await fetch(`/api/getUserInfo?shipId=${encodeURIComponent(String(shipId))}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401/404/500 等都走这里，保持一致
    return {
      success: false,
      error: json?.message || json?.error,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    message: json?.message,
    data: json?.data,
  };
}