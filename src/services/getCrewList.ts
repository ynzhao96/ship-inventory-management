import { http } from "../http";
// 获取船员列表接口
export const getCrewList = async (shipId?: string) => {
  return await http(`/api/getCrewList?shipId=${encodeURIComponent(String(shipId))}`, {
    method: 'GET',
  });
};