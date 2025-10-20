import { http } from "../http";
// 更新物料类别
export const updateInbound = async (
  inbound: {
    inboundId: string,
    batchNumber?: string,
    quantity?: number,
  },
  operation: 'UPDATE' | 'DELETE') => {
  const body = {
    inbound: inbound,
    operation: operation
  };
  return await http('/api/updateInbound', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};