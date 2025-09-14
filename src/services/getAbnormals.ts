import { http } from "../http";
// 获取异常信息
export const getAbnormals = async () => {
  return await http('/api/getAbnormals', {
    method: 'GET',
  });
}