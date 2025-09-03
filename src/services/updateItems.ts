import { http } from "../http";
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
  return await http('/api/updateItems', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};