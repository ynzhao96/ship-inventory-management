import { http } from "../http";
// 获取全部库存接口
export const getInventoryList = async (shipId?: string, categoryId?: string, page?: number, pageSize?: number, searchMatch?: string) => {
  return await http(`/api/getInventoryList`, {
    method: 'POST',
    body: JSON.stringify({ shipId, searchMatch, categoryId, page, pageSize })
  });
};