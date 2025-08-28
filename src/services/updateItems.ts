import { getToken } from "../http";
// 更新物料信息
export const updateItems = async (items: {
  itemId: string,
  itemName?: string,
  itemNameEn?: string,
  categoryId?: string,
  unit?: string,
  specification?: string
}[]) => {
  const body = {
    items: items
  };
  const token = getToken();
  const res = await fetch('/api/updateItems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
    body: JSON.stringify(body),
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok || json?.success !== true) {
    return {
      success: false,
      error: json?.message || json?.error || `更新失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: true,
    data: json?.data,
    message: json?.message || '更新物料信息成功',
  };
};