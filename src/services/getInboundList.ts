// 获取待入库信息
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