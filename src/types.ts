export enum CargoType {
  LIQUID = '液体',
  CONTAINER = '集装箱',
  BULK = '散货'
}

export enum CargoStatus {
  STORED = '已入库',
  IN_TRANSIT = '运输中',
  PENDING = '待入库'
}

export enum ShipType {
  CARGO = '货船',
  TANKER = '油轮',
  CONTAINER = '集装箱船'
}

export enum ShipStatus {
  IN_PORT = '在港',
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
  status: ShipStatus;
  location: string;
  capacity: number;
  currentLoad: number;
  lastMaintenance: Date;
} 