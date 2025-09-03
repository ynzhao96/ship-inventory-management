import { http } from "../http";
// 获取库存类型
export const getCategories = async () => {
  return await http('/api/getCategories', {
    method: 'GET',
  });
}