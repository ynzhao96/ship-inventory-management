import { http } from "../http";
// 获取物料指南
export const getItemList = async (page?: number, pageSize?: number) => {
  const body = { page, pageSize };
  return await http(`/api/getItemList`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
