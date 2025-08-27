import { InboundItemInput } from "../types";

// 批量添加入库
export const createInboundBatch = async (params: {
  batchNo: string;
  shipId?: number | string;
  items: InboundItemInput[];
}) => {
  const body = {
    batchNo: String(params.batchNo ?? '').trim(),
    shipId: normalizeId(params.shipId),
    items: (params.items ?? []).map(it => ({
      itemId: String(it.itemId ?? '').trim(),
      quantity: Number(it.quantity ?? 0),
    })),
  };
  const res = await fetch('/api/createInboundBatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok || json?.success !== true) {
    return {
      success: false,
      error: json?.message || json?.error || `创建失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: true,
    data: json?.data,
    message: json?.message || '创建入库批次成功',
  };
};

function normalizeId(input: any): string {
  if (input && typeof input === 'object') {
    const v = input.shipId ?? input.id ?? input.value ?? input.key;
    return v != null ? String(v) : '';
  }
  return String(input ?? '');
}