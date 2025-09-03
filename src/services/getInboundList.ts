import { http } from "../http";
// 获取待入库信息
export const getInboundList = async (shipId?: string) => {
  return await http(`/api/getInboundList/?shipId=${encodeURIComponent(String(shipId))}`, {
    method: 'GET',
  });
}