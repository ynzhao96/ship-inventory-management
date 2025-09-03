import { http } from "../http";
// 获取船舶列表接口
export const getShipList = async () => {
  return await http('/api/getShipList', {
    method: 'GET',
  });
};

// import { getToken } from "../http";
// // 获取船舶列表接口
// export const getShipList = async () => {
//   const token = getToken();
//   const res = await fetch('/api/getShipList', {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json', 'x-token': `${token}` },
//   });

//   let json: any = {};
//   try { json = await res.json(); } catch { }

//   if (!res.ok) {
//     return {
//       success: false,
//       error: json?.message || json?.error || `获取船舶失败(${res.status})`,
//       code: json?.code || 'ERROR',
//       data: null,
//     };
//   }

//   return {
//     success: json?.success === true,
//     message: json?.message || 'OK',
//     data: json?.data ?? [],     // 这里统一返回 data
//   };
// };