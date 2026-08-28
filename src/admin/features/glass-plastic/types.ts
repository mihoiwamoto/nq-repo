export type RepairStatus = "action_needed" | "repairing" | "repaired" | "no_repair";

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  action_needed: "要対応",
  repairing: "修理中",
  repaired: "修理完了",
  no_repair: "修理しない",
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  repairing: "var(--semantic-status-caution)",
  repaired: "var(--semantic-status-success)",
  no_repair: "var(--semantic-text-secondary)",
};

export const REPAIR_STATUS_ORDER: RepairStatus[] = ["action_needed", "repairing", "repaired", "no_repair"];

export type RepairItem = {
  id: string;
  room: string;
  name: string;
  status: RepairStatus;
  content: string;
  cause: string;
  actionType: string;
  actionDetail?: string;
};

export type MapItemCategory =
  | "hinged_door"
  | "sliding_door"
  | "shutter"
  | "window_glass"
  | "clock"
  | "thermometer"
  | "mirror"
  | "dock_shelter"
  | "glass_cabinet"
  | "plastic_shelf"
  | "knife_cutter";

export const MAP_ITEM_CATEGORY_ORDER: MapItemCategory[] = [
  "hinged_door",
  "sliding_door",
  "shutter",
  "window_glass",
  "clock",
  "thermometer",
  "mirror",
  "dock_shelter",
  "glass_cabinet",
  "plastic_shelf",
  "knife_cutter",
];

export const MAP_ITEM_CATEGORY_LABELS: Record<MapItemCategory, string> = {
  hinged_door: "開き戸",
  sliding_door: "引き戸",
  shutter: "シャッター",
  window_glass: "窓ガラス",
  clock: "時計",
  thermometer: "温度計",
  mirror: "鏡",
  dock_shelter: "ドックシェルター",
  glass_cabinet: "ガラス戸棚",
  plastic_shelf: "プラスチック棚",
  knife_cutter: "包丁/カッター類",
};

export type MapItem = {
  id: string;
  room: string;
  name: string;
  category: MapItemCategory;
  x: number;
  y: number;
};

export type Floor = {
  id: string;
  name: string;
  displayFrom?: string;
  displayTo?: string;
  planImageUrl?: string;
  mapItems: MapItem[];
  repairItems: RepairItem[];
};
