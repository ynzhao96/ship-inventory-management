export interface Ship {
  id: string;
  name: string;
  type: string;
}

export interface Crew {
  id?: number;         // 新增时可不传；已有的稳定 id 会被保留
  name: string;
  position: string;
}

export interface UserInfo {
  username?: string;
  password?: string;
}

export type InboundItemInput = {
  itemId: number | string;
  itemName: string;
  itemNameEn?: string;
  categoryId: string;
  quantity: number | string;
  unit: string;
  specification?: string;
  remark?: string;
};

export type Category = {
  categoryId: string;
  categoryName: string;
  categoryNameEn: string;
}

export type Inbound = {
  batchNumber?: string;
  createdAt?: string;
  inboundId?: number;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  status?: string;
  unit?: string;
}

export type InventoryItem = {
  itemId: number | string;
  itemName: string;
  itemNameEn?: string;
  categoryId: string;
  categoryName?: string;
  quantity: number | string;
  inboundQuantity: string;
  unit: string;
  specification?: string;
  remark?: string;
}

export type ItemLog = {
  inbounds: {
    batchNumber?: string;
    quantity?: number;
    createdAt?: string;
  }[];
  confirms: {
    batchNumber?: string;
    quantity?: number;
    actualQuantity?: number;
    confirmedAt?: string;
    confirmRemark?: string;
  }[];
  claims: {
    quantity?: number;
    claimer?: string;
    claimedAt?: string;
    claimRemark?: string;
  }[];
}