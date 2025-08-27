import { Crew } from '../types';
import { getToken } from "../http";
// 更新船员接口
export const updateCrews = async (
  shipId: string | number,
  crews: Crew[],
  opts?: { signal?: AbortSignal }
) => {
  const token = getToken();
  const res = await fetch('/api/updateCrews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
    body: JSON.stringify({ shipId, crews }),
    signal: opts?.signal,
  });

  let payload: any = {};
  try { payload = await res.json(); } catch { }

  if (!res.ok || payload?.success !== true) {
    return {
      success: false,
      code: payload?.code || 'ERROR',
      message: payload?.message || payload?.error || '保存失败',
      error: payload?.error,
    };
  }

  return {
    success: true,
    code: payload?.code || 'OK',
    message: payload?.message,
    data: payload?.data as Crew[],
  };
};