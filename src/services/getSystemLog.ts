import { http } from "../http";
// 获取系统日志
export const getSystemLog = async (page?: number, pageSize?: number, startTime?: string, endTime?: string) => {
  const body = {
    page, pageSize, startTime, endTime
  };
  return await http('/api/getShipList', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};