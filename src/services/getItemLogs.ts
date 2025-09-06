import { http } from "../http";
import { formatTime } from '../utils.ts';
// 获取物资日志记录

type Claim = { claimedAt: string;[k: string]: any };
type Confirm = { confirmedAt: string;[k: string]: any };
type Inbound = { createdAt: string;[k: string]: any };

type ItemLogsResponse = {
  claims?: Claim[];
  confirms?: Confirm[];
  inbounds?: Inbound[];
  [k: string]: any;
};

export const getItemLogs = async (itemId: string, shipId: string) => {
  const res = await http(`/api/getItemLogs?itemId=${encodeURIComponent(itemId)}&shipId=${encodeURIComponent(shipId)}`, { method: 'GET' });
  const data = (res.data || {}) as ItemLogsResponse;

  const claims = data.claims?.map(c => ({
    ...c,
    claimedAtText: c.claimedAt ? formatTime(c.claimedAt) : '',
  })) ?? [];

  const confirms = data.confirms?.map(c => ({
    ...c,
    confirmedAtText: c.confirmedAt ? formatTime(c.confirmedAt) : '',
  })) ?? [];

  const inbounds = data.inbounds?.map(i => ({
    ...i,
    createdAtText: i.createdAt ? formatTime(i.createdAt) : '',
  })) ?? [];

  return {
    ...res,
    data: { ...data, claims, confirms, inbounds },
  };
}
