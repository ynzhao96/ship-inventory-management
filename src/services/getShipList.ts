import { http } from "../http";
// 获取船舶列表接口
export const getShipList = async () => {
  return await http('/api/getShipList', {
    method: 'GET',
  });
};