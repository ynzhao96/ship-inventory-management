import { http } from "../http";
import { formatTime } from "../utils";
// 获取系统日志

enum EVENT_TYPES {
  INBOUND_CREATED = '创建入库',
  INBOUND_CONFIRMED = '确认入库',
  INBOUND_CANCELED = '取消入库',
  AUTH_LOGIN = '管理端登录',
  OTHER = '其他',
  CLAIM = '申领',
}

export const getSystemLog = async (page?: number, pageSize?: number, startTime?: string, endTime?: string) => {
  const body = {
    page, pageSize, startTime, endTime
  };
  const res = await http('/api/getSystemLog', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = (res.data || {});

  const list = data.list?.map((l: any) => {
    const mappedEventType = EVENT_TYPES[l.eventType as keyof typeof EVENT_TYPES];
    return {
      ...l,
      time: l.time ? formatTime(l.time) : '',
      eventType: mappedEventType ?? '未知事件', // 兜底
    };
  });

  return {
    ...res,
    data: { ...data, list }
  }
};