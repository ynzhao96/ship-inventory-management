import { Crew, InboundItemInput } from './types';

export const ping = async () => {
  const response = await fetch('/api/ping', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};

// 管理员登录接口
export const adminLogin = async (username: string, password: string) => {
  const res = await fetch('/api/adminLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  let data: any = {};
  try { data = await res.json(); } catch { }

  if (!res.ok) {
    // 401 / 404 / 500 等都走这里
    return {
      success: false,
      error: data?.message || data?.error || `登录失败(${res.status})`,
      code: data?.code || 'ERROR',
    };
  }

  return {
    success: data?.success === true,
    user: data?.user,
    message: data?.message || '登录成功',
  };
};

// 获取用户账户密码信息
export const getUserInfo = async (shipId?: string) => {
  const res = await fetch(`/api/getUserInfo?shipId=${encodeURIComponent(String(shipId))}`);

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

// 更新用户账号密码信息
export const updateUserInfo = async (shipId: string, username?: string, password?: string) => {
  // 只把有值的字段放进 body
  const body: any = { shipId };
  if (username !== undefined) body.username = username;
  if (password !== undefined) body.password = password;

  const res = await fetch('/api/updateUserInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok) {
    return {
      success: false,
      error: json?.message || json?.error || `保存失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: json?.success === true,
    // 后端成功返回形如 { success, code, message, data: {...} }
    // 为与 adminLogin 一致，这里将 data 映射为 user
    data: json?.data,
    message: json?.message || '保存成功',
  };
};

// 更新物料信息
export const updateItems = async (items: {
  itemId: string,
  itemName?: string,
  itemNameEn?: string,
  unit?: string,
  specification?: string
}[]) => {
  const body = {
    items: items
  };
  const res = await fetch('/api/updateItems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let json: any = {};
  try { json = await res.json(); } catch { }

  if (!res.ok || json?.success !== true) {
    return {
      success: false,
      error: json?.message || json?.error || `更新失败(${res.status})`,
      code: json?.code || 'ERROR',
    };
  }

  return {
    success: true,
    data: json?.data,
    message: json?.message || '更新物料信息成功',
  };
};

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
  const res = await fetch('/api/getInboundList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shipId: shipId
    }),
  });

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

export const getConfirmList = async (shipID: string) => {
  const response = await fetch('/api/getConfirmList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID })
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

function normalizeId(input: any): string {
  if (input && typeof input === 'object') {
    const v = input.shipId ?? input.id ?? input.value ?? input.key;
    return v != null ? String(v) : '';
  }
  return String(input ?? '');
}