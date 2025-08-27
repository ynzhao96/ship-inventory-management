import { getToken } from "../http";
// 增加预警值
export const updateThreshold = async (shipId: string, items: { itemId: string, threshold: number }[]) => {
  const token = getToken();
  const res = await fetch('/api/updateThreshold', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
    body: JSON.stringify({ shipId, items })
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
};