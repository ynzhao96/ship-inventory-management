import { http } from "../http";
// 获取船舶信息接口
export const getShipInfo = async (id?: string | number) => {
  return await http(`/api/getShipInfo?id=${encodeURIComponent(String(id))}`, {
    method: 'GET',
  });
}