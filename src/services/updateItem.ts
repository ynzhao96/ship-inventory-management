import { http } from "../http";
// 更新物料信息
export const updateItem = async (
  item: {
    itemId: string,
    itemName?: string,
    itemNameEn?: string,
    categoryId?: string,
    unit?: string,
    specification?: string
  },
  operation: 'INSERT' | 'UPDATE' | 'DELETE') => {
  const body = {
    item: item,
    operation: operation
  };
  return await http('/api/updateItem', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};