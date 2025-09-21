import { http } from "../http";
// 更新物料类别
export const updateCategory = async (
  category: {
    categoryId: string,
    categoryName?: string,
    categoryNameEn?: string,
  },
  operation: 'INSERT' | 'UPDATE' | 'DELETE') => {
  const body = {
    category: category,
    operation: operation
  };
  return await http('/api/updateCategory', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};