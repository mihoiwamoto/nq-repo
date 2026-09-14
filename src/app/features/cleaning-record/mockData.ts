export type Frequency = "daily" | "weekly" | "monthly" | "yearly";
export type LineStatus = "not_inspected" | "in_progress" | "inspected" | "confirmed" | "skipped";

export type Line = {
  id: string;
  name: string;
  frequency: Frequency;
  status: LineStatus;
  /** 清掃予定として登録された実施予定日 (YYYY-MM-DD)。毎週タブはこの日付ごとにまとめて表示する */
  scheduledDate?: string;
  /**
   * 見送り時のダイアログ「明日に見送る」で選んだ内容。
   * true(はい)  … 翌日に「未点検」として出続ける
   * false(いいえ) … 清掃自体がなくなり、翌日は表示されない
   */
  deferToTomorrow?: boolean;
  inspectorName?: string;
  inspectionDate?: string;
};

export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  not_inspected: "未点検",
  in_progress: "点検中",
  inspected: "点検済み",
  confirmed: "確認完了",
  skipped: "見送り",
};

export const LINE_STATUS_COLORS: Record<LineStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  in_progress: "var(--semantic-status-done)",
  inspected: "#DCAA14",
  confirmed: "var(--semantic-status-success)",
  skipped: "var(--semantic-status-caution)",
};

export const lines: Line[] = [
  { id: "c1", name: "ゆばライン", frequency: "daily", status: "inspected", inspectorName: "高橋和子", inspectionDate: "2026-08-25" },
  { id: "c2", name: "豆乳ライン", frequency: "daily", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-25" },
  { id: "c3", name: "冷蔵倉庫ライン", frequency: "daily", status: "inspected", inspectorName: "渡辺真由", inspectionDate: "2026-08-25" },
  { id: "c6", name: "充填・包装ライン", frequency: "daily", status: "not_inspected" },
  { id: "c7", name: "原料受入ライン", frequency: "daily", status: "not_inspected" },
  // 毎週は「清掃予定」で登録した日付ごとに表示する。日付は清掃予定カレンダーの登録日 (2025-04-01 / 04-02) に合わせている。
  // 04/01 の清掃対象。ここから見送ると、「明日に見送る」の選択で翌日 (04/02) の出方が下の 2 ケースに分かれる
  { id: "c5", name: "豆乳ライン", frequency: "weekly", status: "in_progress", scheduledDate: "2025-04-01", inspectorName: "小林誠司", inspectionDate: "2025-04-01" },
  { id: "c16", name: "殺菌ライン", frequency: "weekly", status: "confirmed", scheduledDate: "2025-04-01", inspectorName: "高橋和子", inspectionDate: "2025-04-01" },
  { id: "c17", name: "冷蔵倉庫ライン", frequency: "weekly", status: "inspected", scheduledDate: "2025-04-01", inspectorName: "渡辺真由", inspectionDate: "2025-04-01" },
  { id: "c18", name: "充填・包装ライン", frequency: "weekly", status: "skipped", scheduledDate: "2025-04-01", inspectorName: "中村翔太", inspectionDate: "2025-04-01" },
  { id: "c4", name: "ゆばライン", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-01" },
  { id: "c19", name: "原料受入ライン", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-01" },
  { id: "c20", name: "自動計量機・風力選別機ライン", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-01" },
  // 見送り時の「明日に見送る」の選択によって翌日以降の出方が変わるので、両方のケースを 04/02 に並べて確認できるようにしている
  // 「はい」= 翌日に「未点検」として出続ける
  { id: "c21", name: "原料受入ライン（翌日に見送る：はいの場合）", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-02", deferToTomorrow: true },
  // 「いいえ」= 清掃自体がなくなるので翌日は表示されない。その旨を押せない行として置いている
  { id: "c22", name: "原料受入ライン（翌日に見送る：いいえの場合）は表示されない", frequency: "weekly", status: "skipped", scheduledDate: "2025-04-02", deferToTomorrow: false },
  { id: "c8", name: "ゆばライン", frequency: "monthly", status: "inspected", inspectorName: "吉田浩二", inspectionDate: "2026-09-01" },
  { id: "c9", name: "豆乳ライン", frequency: "monthly", status: "inspected", inspectorName: "山本拓海", inspectionDate: "2026-09-01" },
  { id: "c10", name: "冷蔵倉庫ライン", frequency: "monthly", status: "in_progress", inspectorName: "田村康平", inspectionDate: "2026-09-02" },
  { id: "c11", name: "充填・包装ライン", frequency: "monthly", status: "not_inspected" },
  { id: "c12", name: "ゆばライン", frequency: "yearly", status: "inspected", inspectorName: "松本奈々", inspectionDate: "2026-04-01" },
  { id: "c13", name: "冷蔵倉庫ライン", frequency: "yearly", status: "not_inspected" },
  { id: "c14", name: "原料受入ライン", frequency: "yearly", status: "not_inspected" },
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

// 見送りステータスのラインは清掃記録が無い状態で、備考に見送り理由だけが入る
export const skippedRemarks =
  "見送り\n設備メンテナンスのためライン停止中。業者による定期整備作業が終日実施されており、清掃対象の機器にアクセスできないため、本日の清掃を見送りとする。整備完了後の翌営業日に清掃を実施予定。";

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
