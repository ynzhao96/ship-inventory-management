import { http } from "../http";
// 更新用户账号密码信息
export const updateUserInfo = async (shipId: string, username?: string, password?: string) => {
  // 只把有值的字段放进 body
  const body: any = { shipId };
  if (username !== undefined) body.username = username;
  if (password !== undefined) body.password = password;

  return await http('/api/updateUserInfo', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};