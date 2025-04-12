export interface Ship {
  id: string;
  name: string;
  type: ShipType;
  capacity: number;
  currentLoad: number;
  status: ShipStatus;
  location: string;
  lastMaintenance: Date;
}

export enum ShipType {
  CARGO = "货轮",
  TANKER = "油轮",
  CONTAINER = "集装箱船",
  PASSENGER = "客轮",
  FISHING = "渔船"
}

export enum ShipStatus {
  ACTIVE = "活跃",
  MAINTENANCE = "维护中",
  DOCKED = "停泊中",
  LOADING = "装载中",
  UNLOADING = "卸载中",
  DECOMMISSIONED = "退役"
} 