import { Crew } from './types';

export const ping = async () => {
  const response = await fetch('/api/ping', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};


// 获取船舶列表接口
export const getShipList = async () => {
  const res = await fetch('/api/getShipList', { method: 'GET' });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    return {
      success: false,
      error: json?.message || json?.error || `获取船舶失败(${res.status})`,
      code: json?.code || 'ERROR',
      data: null,
    };
  }

  return {
    success: json?.success === true,
    message: json?.message || 'OK',
    data: json?.data ?? [],     // 这里统一返回 data
  };
};

// 获取船舶信息接口
export const getShipInfo = async (id?: string | number) => {
  const res = await fetch(`/api/getShipInfo?id=${encodeURIComponent(String(id))}`);

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401/404/500 等都走这里，保持一致
    return {
      success: false,
      error: json?.message || json?.error,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    message: json?.message,
    data: json?.data,
  };
}

// 获取待入库信息 暂时可能不需要
export const getInboundList = async (shipId?: string) => {
  const res = await fetch(`/api/getInboundList/?shipId=${encodeURIComponent(String(shipId))}`);

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok || json?.success !== true) {
    return {
      success: false,
      error: json?.message || json?.error || `获取失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: true,
    data: json?.data,
    message: json?.message || '获取入库信息成功',
  };
}

export const getHomeInfo = async (shipID: string) => {
  const response = await fetch('/api/getHomeInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID })
  });
  return response.json();
};

export const getLowInventory = async (shipID: string) => {
  const response = await fetch('/api/getLowInventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID })
  });
  return response.json();
};

// 获取全部库存接口
export const getInventoryList = async (shipId?: string) => {
  const response = await fetch('/api/getInventoryList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipId })
  });
  return response.json();
};

export const changeItemRemark = async (shipID: string, itemID: string, remark: string) => {
  const response = await fetch('/api/changeItemRemark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, itemID, remark })
  });
  return response.json();
};

export const confirmItem = async (items: { shipID: string; actualAmount: string; remark: string; }[]) => {
  const response = await fetch('/api/confirmItem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });
  return response.json();
};

export const cancelConfirm = async (shipID: string, confirmID: string, remark: string) => {
  const response = await fetch('/api/cancelConfirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, confirmID, remark })
  });
  return response.json();
};

export const getConfirmLog = async (shipID: string, startTime: string, endTime: string) => {
  const response = await fetch('/api/getConfirmLog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, startTime, endTime })
  });
  return response.json();
};

export const claimItem = async (shipID: string, itemID: string, amount: string, remark: string, claimer: string) => {
  const response = await fetch('/api/claimItem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, itemID, amount, remark, claimer })
  });
  return response.json();
};

export const cancelClaim = async (shipID: string, claimID: string, remark: string) => {
  const response = await fetch('/api/cancelClaim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, claimID, remark })
  });
  return response.json();
};

// 获取船员列表接口
export const getCrewList = async (shipId?: string) => {
  const res = await fetch(`/api/getCrewList?shipId=${encodeURIComponent(String(shipId))}`);

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401/404/500 等都走这里，保持一致
    return {
      success: false,
      error: json?.message || json?.error,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    message: json?.message,
    data: json?.data,
  };
};

// 更新船员接口
export const updateCrews = async (
  shipId: string | number,
  crews: Crew[],
  opts?: { signal?: AbortSignal }
) => {
  const res = await fetch('/api/updateCrews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// 获取库存类型
export const getCategories = async () => {
  const res = await fetch('/api/getCategories');

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401/404/500 等都走这里，保持一致
    return {
      success: false,
      error: json?.message || json?.error,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    message: json?.message,
    data: json?.data,
  };
}

export const getClaimLog = async (shipID: string, startTime: string, endTime: string) => {
  const response = await fetch('/api/getClaimLog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, startTime, endTime })
  });
  return response.json();
};

// 获取预警值
export const getThreshold = async (shipId?: string) => {
  const res = await fetch(`/api/getThreshold?shipId=${encodeURIComponent(String(shipId))}`);

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401/404/500 等都走这里，保持一致
    return {
      success: false,
      error: json?.message || json?.error,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    message: json?.message,
    data: json?.data,
  };
};

// 增加预警值
export const updateThreshold = async (shipId: string, items: { itemId: string, threshold: number }[]) => {
  const res = await fetch('/api/updateThreshold', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipId, items })
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    // 401/404/500 等都走这里，保持一致
    return {
      success: false,
      error: json?.message || json?.error,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    message: json?.message,
    data: json?.data,
  };
};
