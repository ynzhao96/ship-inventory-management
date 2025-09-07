import { http } from "../http";
// 查询船舶日志
export const getShipLogs = async (shipId?: string, page?: number, pageSize?: number, startTime?: string, endTime?: string, logType?: string) => {

  const body = {
    shipId: shipId, page, pageSize, startTime, endTime, logType
  };
  return await http(`/api/getShipLogs`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};