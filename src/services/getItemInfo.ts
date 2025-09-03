import { http } from "../http";
// 获取物资信息接口
export const getItemInfo = async (itemId: string) => {
  return await http(`/api/getItemInfo?itemId=${encodeURIComponent(String(itemId))}`, {
    method: 'GET',
  });
}
