// 本番の RepairStatusType（要対応・修理中・対応完了・修理しない・修理なし）
export type RepairStatus = "action_needed" | "repairing" | "repaired" | "no_repair" | "never_repaired";

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  action_needed: "要対応",
  repairing: "修理中",
  repaired: "対応完了",
  no_repair: "修理しない",
  never_repaired: "修理なし",
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  repairing: "var(--semantic-status-caution)",
  repaired: "var(--semantic-status-success)",
  no_repair: "var(--semantic-text-secondary)",
  never_repaired: "var(--semantic-text-secondary)",
};

export const REPAIR_STATUS_NEXT_OPTIONS: Record<RepairStatus, RepairStatus[]> = {
  action_needed: ["action_needed", "repairing", "no_repair"],
  repairing: ["repairing", "repaired"],
  no_repair: ["no_repair"],
  repaired: ["repaired"],
  // 本番（RepairStatusType::getValidationType）は 修理なし から 要対応 へだけ変えられる
  never_repaired: ["never_repaired", "action_needed"],
};

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
