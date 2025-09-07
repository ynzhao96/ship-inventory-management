import { http } from "../http";
import { formatTime } from '../utils.ts';

type Log = {
  actor?: string;
  batchNumber?: string;
  categoryId?: string;
  eventTime?: string;
  eventType?: string;
  itemId?: string;
  itemName?: string;
  quantity?: string;
  remark?: string;
  shipId?: string;
}

// 查询船舶日志
export const getShipLogs = async (shipId?: string, page?: number, pageSize?: number, startTime?: string, endTime?: string, logType?: string) => {
  const body = {
    shipId: shipId, page, pageSize, startTime, endTime, logType
  };
  const res = await http(`/api/getShipLogs`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = (res.data || {});

  const logs = res.data.list?.map((l: Log) => ({
    ...l,
    eventTime: formatTime(l.eventTime || '')
  }));
  return { ...res, data: { ...data, list: logs } };
};