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