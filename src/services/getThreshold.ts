import { http } from "../http";
// 获取预警值
export const getThreshold = async (shipId?: string) => {
  return await http(`/api/getThreshold?shipId=${encodeURIComponent(String(shipId))}`, {
    method: 'GET',
  });
};