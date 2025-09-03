import { getToken } from "../http";
// 获取全部库存接口
export const getInventoryList = async (shipId?: string, categoryId?: string, page?: number, pageSize?: number, searchMatch?: string) => {
  const token = getToken();
  const response = await fetch('/api/getInventoryList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
    body: JSON.stringify({ shipId, searchMatch, categoryId, page, pageSize })
  });
  return response.json();
};