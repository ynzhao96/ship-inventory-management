import { http } from "../http";
// 获取物料指南
export const getItemList = async (categoryId?: string, page?: number, pageSize?: number, searchMatch?: string) => {
  const body = { categoryId, page, pageSize, searchMatch };
  return await http(`/api/getItemList`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
