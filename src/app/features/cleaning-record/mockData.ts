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
  { id: "c1", name: "ゆばライン", frequency: "daily", status: "inspected", inspectorName: "高橋和子", inspectionDate: "2026-08-25" },
  { id: "c2", name: "豆乳ライン", frequency: "daily", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-25" },
  { id: "c3", name: "冷蔵倉庫ライン", frequency: "daily", status: "inspected", inspectorName: "渡辺真由", inspectionDate: "2026-08-25" },
  { id: "c4", name: "ゆばライン", frequency: "weekly", status: "not_inspected" },
  { id: "c5", name: "豆乳ライン", frequency: "weekly", status: "in_progress", inspectorName: "小林誠司", inspectionDate: "2026-08-24" },
];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "毎日",
  weekly: "毎週",
  monthly: "毎月",
  yearly: "毎年",
};

export type CleaningStatus = "done" | null;

export type CleaningItemRecord = {
  status: CleaningStatus;
  timestamp: string;
  inspector: string;
};

export type CleaningPoint = {
  id: string;
  location: string;
  items: string[];
};

export const cleaningPoints: CleaningPoint[] = [
  { id: "p1", location: "つまみ上げパック機", items: ["シール部", "コンベアベルト", "充填ノズル"] },
  { id: "p2", location: "充填包装機", items: ["コンベア清掃", "充填ノズル洗浄"] },
];

export const initialRecords: Record<string, CleaningItemRecord> = {
  "つまみ上げパック機|シール部": {
    status: "done",
    timestamp: "2026/08/25 07:08",
    inspector: "高橋和子",
  },
  "つまみ上げパック機|コンベアベルト": {
    status: "done",
    timestamp: "2026/08/25 07:12",
    inspector: "高橋和子",
  },
  "つまみ上げパック機|充填ノズル": {
    status: "done",
    timestamp: "2026/08/24 14:25",
    inspector: "佐藤健一",
  },
  "充填包装機|コンベア清掃": {
    status: "done",
    timestamp: "2026/08/23 15:30",
    inspector: "渡辺真由",
  },
};

export const initialRemarks =
  "充填包装機のコンベア清掃時、ベルト裏面に微量の粉体付着あり。通常清掃にて除去済み。次回も重点確認予定。";

export const pendingReviewRecords: Record<string, CleaningItemRecord> = {
  "つまみ上げパック機|シール部": {
    status: "done",
    timestamp: "2025/04/01 07:08",
    inspector: "高橋和子",
  },
  "つまみ上げパック機|コンベアベルト": {
    status: "done",
    timestamp: "2025/04/01 07:12",
    inspector: "高橋和子",
  },
  "つまみ上げパック機|充填ノズル": {
    status: "done",
    timestamp: "2025/04/01 07:18",
    inspector: "高橋和子",
  },
  "充填包装機|コンベア清掃": {
    status: "done",
    timestamp: "2025/04/01 20:12",
    inspector: "高橋和子",
  },
  "充填包装機|充填ノズル洗浄": {
    status: "done",
    timestamp: "2025/04/01 20:19",
    inspector: "高橋和子",
  },
};

export const ACTORS = [
  { id: "1042587", name: "高橋和子" },
  { id: "1035921", name: "佐藤健一" },
  { id: "1028764", name: "渡辺真由" },
  { id: "1051438", name: "小林誠司" },
  { id: "1067215", name: "吉田浩二" },
  { id: "1019863", name: "山本拓海" },
  { id: "1073492", name: "田村康平" },
  { id: "1084156", name: "松本奈々" },
  { id: "1091327", name: "中村翔太" },
];
