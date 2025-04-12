export interface Cargo {
  id: string;
  name: string;
  type: CargoType;
  weight: number;
  volume: number;
  shipId: string | null;
  status: CargoStatus;
  destination: string;
  arrivalDate: Date | null;
}

export enum CargoType {
  BULK = "散装货物",
  CONTAINER = "集装箱",
  LIQUID = "液体货物",
  REFRIGERATED = "冷冻货物",
  HAZARDOUS = "危险品"
}

export enum CargoStatus {
  STORED = "仓储中",
  LOADING = "装载中",
  IN_TRANSIT = "运输中",
  UNLOADING = "卸载中",
  DELIVERED = "已交付"
} 