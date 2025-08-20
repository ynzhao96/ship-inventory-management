export enum CargoType {
  LIQUID = '液体',
  CONTAINER = '集装箱',
  BULK = '散货'
}

export enum CargoStatus {
  STORED = '已入库',
  IN_TRANSIT = '运输中',
  PENDING = '待入库',
  LOADING = '装货中',
  UNLOADING = '卸货中',
  DELIVERED = '已送达'
}

export enum ShipType {
  CARGO = '货船',
  TANKER = '油轮',
  CONTAINER = '集装箱船'
}

export enum ShipStatus {
  ACTIVE = '活跃',
  IN_PORT = '在港',
  LOADING = '装货中',
  UNLOADING = '卸货中',
  DECOMMISSIONED = '',
  AT_SEA = '在航',
  MAINTENANCE = '维修中',
  DOCKED = '停泊'
}

export interface Cargo {
  id: string;
  name: string;
  type: CargoType;
  weight: number;
  volume: number;
  shipId: string;
  status: CargoStatus;
  destination: string;
  arrivalDate: Date;
  cargoCode: string;
  cargoCategory: string;
  quantity: number;
}

export interface Ship {
  id: string;
  name: string;
  type: ShipType;
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
  id: string;
  itemId: number | string;
  itemName: string;
  itemType: string;
  quantity: number | string;
  unit: string;
};