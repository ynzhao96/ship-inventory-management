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
export const getShipInfo = async (id: string | number) => {
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

export const getInventoryList = async (shipID: string) => {
  const response = await fetch('/api/getInventoryList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID })
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

export const getClaimerList = async (shipID: string) => {
  const response = await fetch('/api/getClaimerList', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID })
  });
  return response.json();
};

export const getClaimLog = async (shipID: string, startTime: string, endTime: string) => {
  const response = await fetch('/api/getClaimLog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipID, startTime, endTime })
  });
  return response.json();
}; 