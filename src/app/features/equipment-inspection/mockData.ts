export type Frequency = "daily" | "weekly" | "monthly" | "yearly";
export type LineStatus = "not_inspected" | "in_progress" | "inspected" | "skipped";

export type Line = {
  id: string;
  name: string;
  frequency: Frequency;
  status: LineStatus;
  inspectorName?: string;
  inspectionDate?: string;
};

export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  not_inspected: "未点検",
  in_progress: "点検中",
  inspected: "点検済み",
  skipped: "見送り",
};

export const LINE_STATUS_COLORS: Record<LineStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  in_progress: "var(--semantic-status-done)",
  inspected: "#DCAA14",
  skipped: "var(--semantic-status-caution)",
};

export const lines: Line[] = [
  { id: "l1", name: "豆乳ライン", frequency: "weekly", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-25" },
  { id: "l2", name: "ゆばライン（その他）", frequency: "weekly", status: "inspected", inspectorName: "高橋和子", inspectionDate: "2026-08-25" },
  { id: "l3", name: "殺菌ライン", frequency: "weekly", status: "inspected", inspectorName: "渡辺真由", inspectionDate: "2026-08-25" },
  { id: "l4", name: "冷蔵倉庫ライン", frequency: "weekly", status: "not_inspected" },
  { id: "l5", name: "充填・包装ライン", frequency: "weekly", status: "not_inspected" },
  { id: "l6", name: "原料受入ライン", frequency: "weekly", status: "not_inspected" },
  { id: "l7", name: "豆乳ライン", frequency: "yearly", status: "not_inspected" },
  { id: "l8", name: "豆乳ライン", frequency: "daily", status: "not_inspected" },
  { id: "l9", name: "ゆばライン（つまみ関係）", frequency: "daily", status: "in_progress", inspectorName: "小林誠司", inspectionDate: "2026-08-25" },
  { id: "l10", name: "ゆばライン（その他）", frequency: "daily", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-24" },
  { id: "l11", name: "自動計量機・風力選別機ライン", frequency: "daily", status: "not_inspected" },
];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "毎日",
  weekly: "毎週",
  monthly: "毎月",
  yearly: "毎年",
};

export type ScheduleEntry = { dateKey: string; lineIds: string[] };

export const initialScheduleEntries: Record<string, ScheduleEntry> = {
  "2025-04-01": { dateKey: "2025-04-01", lineIds: ["l1", "l2", "l7"] },
};

export type ItemStatus = "ok" | "ng" | null;

export const CAUSE_OPTIONS = ["汚れ", "故障", "部品の欠落", "破損", "その他"] as const;
export type CauseOption = (typeof CAUSE_OPTIONS)[number];

export const ACTION_OPTIONS = ["修理", "その他"] as const;
export type ActionOption = (typeof ACTION_OPTIONS)[number];

export type InspectionItemRecord = {
  status: ItemStatus;
  cause: CauseOption | null;
  actionType: ActionOption | null;
  actionDetail: string;
  timestamp: string;
  inspector: string;
};

export type InspectionPoint = {
  id: string;
  location: string;
  items: string[];
};

export const confirmationItems = [
  "破損、損傷、部品の欠落、劣化等がないか",
  "異物や汚れは付いていないか",
  "問題なく動作するか",
  "【豆乳ライン】洗浄後のすすぎ残しがないか",
  "【ゆばライン(その他)】ゆば槽（膜張り槽）の温度が規定の保温温度に維持されているか",
];

export const inspectionPoints: InspectionPoint[] = [
  { id: "p1", location: "エコスター", items: ["定量部", "タンク部", "駆動ベルト"] },
  { id: "p2", location: "ボイル槽", items: ["温度計・水位"] },
];

export const initialRecords: Record<string, InspectionItemRecord> = {
  "エコスター|定量部": {
    status: "ok",
    cause: null,
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/25 07:15",
    inspector: "佐藤健一",
  },
  "エコスター|タンク部": {
    status: "ng",
    cause: "汚れ",
    actionType: "その他",
    actionDetail: "内部に油汚れを確認、分解洗浄を実施済み",
    timestamp: "2026/08/25 07:08",
    inspector: "佐藤健一",
  },
  "ボイル槽|温度計・水位": {
    status: "ok",
    cause: null,
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/25 06:52",
    inspector: "高橋和子",
  },
  "エコスター|駆動ベルト": {
    status: "ok",
    cause: null,
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/24 14:30",
    inspector: "渡辺真由",
  },
  "ボイル槽|駆動部": {
    status: "ok",
    cause: null,
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/23 09:45",
    inspector: "小林誠司",
  },
};

export const initialRemarks =
  "エコスター タンク部に油汚れを確認。分解洗浄にて対応済み。次回点検時に再確認予定。その他の点検項目は異常なし。";
