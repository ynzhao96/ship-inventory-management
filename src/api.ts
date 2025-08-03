export const ping = async () => {
  const response = await fetch('/api/ping', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};

export const login = async (username: string, password: string) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

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