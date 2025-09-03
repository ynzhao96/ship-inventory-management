import { http } from "../http";
// 增加预警值
export const updateThreshold = async (shipId: string, items: { itemId: string, threshold: number }[]) => {
  return await http('/api/updateThreshold', {
    method: 'POST',
    body: JSON.stringify({ shipId, items })
  });
};