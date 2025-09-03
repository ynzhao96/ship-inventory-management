import { http } from "../http";
// 获取用户账户密码信息
export const getUserInfo = async (shipId?: string) => {
  return await http(`/api/getUserInfo?shipId=${encodeURIComponent(String(shipId))}`, {
    method: 'GET',
  });
}