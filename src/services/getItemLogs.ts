import { http } from "../http";
// 获取物资日志记录
export const getItemLogs = async (itemId: string, shipId: string) => {
  return await http(`/api/getItemLogs?itemId=${encodeURIComponent(String(itemId))}&shipId=${encodeURIComponent(String(shipId))}`, {
    method: 'GET',
  });
}
