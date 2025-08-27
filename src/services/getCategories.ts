import { getToken } from "../http";
// 获取库存类型
export const getCategories = async () => {
  const token = getToken();
  const res = await fetch('/api/getCategories', {
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