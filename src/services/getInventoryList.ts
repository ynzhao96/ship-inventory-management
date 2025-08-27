import { getToken } from "../http";
// 获取全部库存接口
export const getInventoryList = async (shipId?: string) => {
  const token = getToken();
  const response = await fetch('/api/getInventoryList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
    body: JSON.stringify({ shipId })
  });
  return response.json();
};