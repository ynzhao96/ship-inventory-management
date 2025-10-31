import { InboundItemInput } from "../types";
import { http } from "../http";

// 批量添加入库
export const createInboundBatch = async (params: {
  batchNo: string;
  creator: string;
  shipId?: number | string;
  items: InboundItemInput[];
}) => {
  const body = {
    batchNo: String(params.batchNo ?? '').trim(),
    creator: String(params.creator ?? '').trim(),
    shipId: normalizeId(params.shipId),
    items: (params.items ?? []).map(it => ({
      itemId: String(it.itemId ?? '').trim(),
      quantity: Number(it.quantity ?? 0),
    })),
  };

  return await http('/api/createInboundBatch', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

function normalizeId(input: any): string {
  if (input && typeof input === 'object') {
    const v = input.shipId ?? input.id ?? input.value ?? input.key;
    return v != null ? String(v) : '';
  }
  return String(input ?? '');
}