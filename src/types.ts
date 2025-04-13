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