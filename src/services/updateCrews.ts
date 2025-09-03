import { Crew } from '../types';
import { http } from "../http";
// 更新船员接口
export const updateCrews = async (
  shipId: string | number,
  crews: Crew[],
  opts?: { signal?: AbortSignal }
) => {
  return await http('/api/updateCrews', {
    method: 'POST',
    body: JSON.stringify({ shipId, crews }),
    signal: opts?.signal,
  });
};