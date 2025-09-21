import { http } from "../http";
// 更新船舶
export const updateShip = async (
  ship: {
    shipId: string,
    shipName?: string,
    shipType?: string,
  },
  operation: 'INSERT' | 'UPDATE' | 'DELETE') => {
  const body = {
    ship: ship,
    operation: operation
  };
  return await http('/api/updateShip', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};