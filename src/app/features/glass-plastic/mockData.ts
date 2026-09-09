export type FloorStatus = "not_inspected" | "inspected";

export type Floor = {
  id: string;
  name: string;
  status: FloorStatus;
  inspectorName?: string;
  inspectionDate?: string;
};

export const FLOOR_STATUS_LABELS: Record<FloorStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
};

export const FLOOR_STATUS_COLORS: Record<FloorStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
};

export const floors: Floor[] = [
  { id: "f1", name: "フロアA", status: "inspected", inspectorName: "高橋和子", inspectionDate: "2026-08-25" },
  { id: "f2", name: "フロアB", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-25" },
  { id: "f3", name: "フロアC", status: "inspected", inspectorName: "渡辺真由", inspectionDate: "2026-08-24" },
];

export type RoomItemStatus = "ok" | "ng";

export const CONTENT_OPTIONS = ["破損", "ひび割れ", "その他"] as const;
export type ContentOption = (typeof CONTENT_OPTIONS)[number];

export const CAUSE_OPTIONS = ["人や物との接触", "その他"] as const;
export type CauseOption = (typeof CAUSE_OPTIONS)[number];

export const ACTION_OPTIONS = ["補修テープでの応急処置", "修理依頼", "その他"] as const;
export type ActionOption = (typeof ACTION_OPTIONS)[number];

export type RoomItemRecord = {
  status: RoomItemStatus;
  content: ContentOption | null;
  cause: CauseOption | null;
  actionType: ActionOption | null;
  actionDetail: string;
  timestamp: string;
  inspector: string;
};

export type ItemBadge = "repair" | "action_needed";

export const ITEM_BADGE_LABELS: Record<ItemBadge, string> = {
  repair: "修理中",
  action_needed: "要対応",
};

export const ITEM_BADGE_COLORS: Record<ItemBadge, string> = {
  repair: "var(--semantic-status-caution)",
  action_needed: "var(--semantic-status-error)",
};

export type RoomItem = {
  name: string;
  badge?: ItemBadge;
};

export type Room = {
  id: string;
  name: string;
  items: RoomItem[];
};

export const rooms: Room[] = [
  {
    id: "entrance",
    name: "出入口",
    items: [
      { name: "鏡1" },
      { name: "時計1" },
      { name: "プラスチック棚1", badge: "repair" },
      { name: "窓ガラス1", badge: "action_needed" },
    ],
  },
  {
    id: "sanitary-room",
    name: "サニタリー室",
    items: [{ name: "鏡1" }, { name: "窓ガラス1" }, { name: "時計1" }, { name: "窓ガラス2" }, { name: "ガラス戸棚1" }],
  },
  {
    id: "pudding-area",
    name: "プリンエリア",
    items: [{ name: "窓ガラス1" }, { name: "窓ガラス2" }, { name: "時計1" }, { name: "温度計1" }, { name: "プラスチック棚1" }],
  },
  { id: "aseptic-room", name: "無菌室", items: [{ name: "温度計1" }] },
  { id: "sealing-room", name: "シーリング室", items: [{ name: "温度計1" }, { name: "時計1" }] },
  { id: "product-fridge", name: "製品冷蔵室", items: [{ name: "温度計1" }, { name: "時計1" }] },
  {
    id: "shipping-dock",
    name: "出荷口",
    items: [{ name: "シャッター1" }, { name: "シャッター2" }, { name: "ドックシェルター1" }, { name: "ドックシャッター2" }],
  },
  { id: "packing-room", name: "梱包室", items: [{ name: "温度計1" }, { name: "時計1" }] },
  { id: "product-freezer", name: "製品冷凍室", items: [{ name: "温度計1" }, { name: "時計1" }] },
  { id: "quick-freezer", name: "急速冷凍庫", items: [{ name: "温度計1" }] },
  { id: "packing-area", name: "パッキングエリア", items: [{ name: "温度計1" }, { name: "プラスチック棚1" }] },
  {
    id: "frozen-cake-area",
    name: "冷凍ケーキエリア",
    items: [{ name: "時計1" }, { name: "温度計1" }, { name: "プラスチック棚1" }],
  },
  {
    id: "ice-area",
    name: "アイスエリア",
    items: [{ name: "時計1" }, { name: "温度計1" }, { name: "プラスチック棚1" }, { name: "プラスチック棚2" }],
  },
  { id: "washing-room", name: "洗浄室", items: [{ name: "時計1" }, { name: "窓ガラス1" }] },
  {
    id: "mixing-room",
    name: "配合室",
    items: [{ name: "時計1" }, { name: "時計2" }, { name: "プラスチック棚1" }, { name: "温度計1" }],
  },
  { id: "drying-room-2", name: "乾燥室2", items: [{ name: "包丁/カット類1" }, { name: "ガラス戸棚1" }] },
  { id: "storage-room", name: "保管庫", items: [{ name: "シャッター1" }, { name: "ドックシェルター1" }] },
  { id: "seasoning-storage", name: "調味料・資材庫", items: [{ name: "温度計1" }] },
  { id: "material-freezer", name: "原料冷凍庫", items: [{ name: "温度計1" }] },
  { id: "material-fridge", name: "原料冷蔵庫", items: [{ name: "温度計1" }] },
  {
    id: "receiving-area",
    name: "入荷エリア",
    items: [{ name: "時計1" }, { name: "シャッター1" }, { name: "ドックシェルター1" }],
  },
  { id: "egg-receiving-dock", name: "原卵入荷口", items: [{ name: "シャッター1" }, { name: "ドックシェルター1" }] },
];

export type RepairStatus = "action_needed" | "no_repair" | "repairing" | "repaired";

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  action_needed: "要対応",
  no_repair: "修理しない",
  repairing: "修理中",
  repaired: "修理完了",
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  no_repair: "var(--semantic-text-secondary)",
  repairing: "var(--semantic-status-caution)",
  repaired: "var(--semantic-status-success)",
};

export const REPAIR_STATUS_NEXT_OPTIONS: Record<RepairStatus, RepairStatus[]> = {
  action_needed: ["action_needed", "repairing", "no_repair"],
  repairing: ["repairing", "repaired"],
  no_repair: ["no_repair"],
  repaired: ["repaired"],
};

export const initialInspectionRecords: Record<string, RoomItemRecord> = {};
