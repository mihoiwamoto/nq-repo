export type Frequency = "daily" | "weekly" | "monthly" | "yearly";
export type LineStatus = "not_inspected" | "in_progress" | "inspected" | "confirmed" | "skipped";

export type Line = {
  id: string;
  name: string;
  frequency: Frequency;
  status: LineStatus;
  /** 点検予定画面で登録された実施予定日 (YYYY-MM-DD)。毎週タブはこの日付ごとにまとめて表示する */
  scheduledDate?: string;
  /**
   * 見送り時のダイアログ「明日に見送る」で選んだ内容。
   * true(はい)  … 翌日に「未点検」として出続ける
   * false(いいえ) … 点検自体がなくなり、翌日は表示されない
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
  // 毎週は「点検予定」で登録した日付ごとに表示する。日付は点検予定カレンダーの登録日 (2025-04-01 / 04-02) に合わせている。
  // 04/01 の点検対象。ここから見送ると、「明日に見送る」の選択で翌日 (04/02) の出方が下の 2 ケースに分かれる
  { id: "l19", name: "原料受入ライン", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-01" },
  { id: "l1", name: "豆乳ライン", frequency: "weekly", status: "confirmed", scheduledDate: "2025-04-01", inspectorName: "佐藤健一", inspectionDate: "2025-04-01" },
  { id: "l2", name: "ゆばライン（その他）", frequency: "weekly", status: "inspected", scheduledDate: "2025-04-01", inspectorName: "高橋和子", inspectionDate: "2025-04-01" },
  { id: "l3", name: "殺菌ライン", frequency: "weekly", status: "inspected", scheduledDate: "2025-04-01", inspectorName: "渡辺真由", inspectionDate: "2025-04-01" },
  { id: "l5", name: "充填・包装ライン", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-01" },
  // 見送り時の「明日に見送る」の選択によって翌日以降の出方が変わるので、両方のケースを 04/02 に並べて確認できるようにしている
  // 「はい」= 翌日に「未点検」として出続ける
  { id: "l6", name: "原料受入ライン（翌日に見送る：はいの場合）", frequency: "weekly", status: "not_inspected", scheduledDate: "2025-04-02", deferToTomorrow: true },
  // 「いいえ」= 点検自体がなくなるので翌日は表示されない。その旨を押せない行として置いている
  { id: "l18", name: "原料受入ライン（翌日に見送る：いいえの場合）は表示されない", frequency: "weekly", status: "skipped", scheduledDate: "2025-04-02", deferToTomorrow: false },
  { id: "l7", name: "豆乳ライン", frequency: "yearly", status: "not_inspected" },
  { id: "l8", name: "豆乳ライン", frequency: "daily", status: "not_inspected" },
  { id: "l9", name: "ゆばライン（つまみ関係）", frequency: "daily", status: "in_progress", inspectorName: "小林誠司", inspectionDate: "2026-08-25" },
  { id: "l10", name: "ゆばライン（その他）", frequency: "daily", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-24" },
  { id: "l11", name: "自動計量機・風力選別機ライン", frequency: "daily", status: "not_inspected" },
  { id: "l12", name: "冷凍・冷蔵設備ライン", frequency: "monthly", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-09-01" },
  { id: "l13", name: "排水処理設備ライン", frequency: "monthly", status: "inspected", inspectorName: "高橋和子", inspectionDate: "2026-09-01" },
  { id: "l14", name: "ボイラー設備ライン", frequency: "monthly", status: "in_progress", inspectorName: "渡辺真由", inspectionDate: "2026-09-08" },
  { id: "l15", name: "コンプレッサー設備ライン", frequency: "monthly", status: "not_inspected" },
  { id: "l16", name: "空調・フィルターライン", frequency: "monthly", status: "not_inspected" },
  { id: "l17", name: "計量器・秤設備ライン", frequency: "monthly", status: "skipped", inspectorName: "小林誠司", inspectionDate: "2026-09-02" },
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

export const ACTION_OPTIONS = ["修理", "修理（外部委託）", "交換", "掃除", "その他"] as const;
export type ActionOption = (typeof ACTION_OPTIONS)[number];

export type InspectionItemRecord = {
  status: ItemStatus;
  cause: CauseOption | null;
  causeDetail: string;
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
    causeDetail: "",
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/25 07:15",
    inspector: "佐藤健一",
  },
  "エコスター|タンク部": {
    status: "ng",
    cause: "汚れ",
    causeDetail: "",
    actionType: "その他",
    actionDetail: "内部に油汚れを確認、分解洗浄を実施済み",
    timestamp: "2026/08/25 07:08",
    inspector: "佐藤健一",
  },
  "ボイル槽|温度計・水位": {
    status: "ok",
    cause: null,
    causeDetail: "",
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/25 06:52",
    inspector: "高橋和子",
  },
  "エコスター|駆動ベルト": {
    status: "ok",
    cause: null,
    causeDetail: "",
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/24 14:30",
    inspector: "渡辺真由",
  },
  "ボイル槽|駆動部": {
    status: "ok",
    cause: null,
    causeDetail: "",
    actionType: null,
    actionDetail: "",
    timestamp: "2026/08/23 09:45",
    inspector: "小林誠司",
  },
};

export const initialRemarks =
  "エコスター タンク部に油汚れを確認。分解洗浄にて対応済み。次回点検時に再確認予定。その他の点検項目は異常なし。";

// 見送りステータスのラインは点検記録が無い状態で、備考に見送り理由だけが入る
export const skippedRemarks =
  "見送り\n設備メンテナンスのためライン停止中。業者による定期整備作業が終日実施されており、点検対象の機器にアクセスできないため、本日の点検を見送りとする。整備完了後の翌営業日に点検を実施予定。";

/** 確認待ち（差し戻し）で表示する、承認者からの差し戻し理由コメント。ライン ID ごとに持つ */
export type LineRejectionComment = {
  id: string;
  authorName: string;
  timestamp: string;
  body: string;
};

export const LINE_REJECTION_COMMENTS: Record<string, LineRejectionComment[]> = {
  l8: [
    {
      id: "c1",
      authorName: "鈴木一郎",
      timestamp: "25.04.02 10:16",
      body: "エコスター タンク部の対応内容が不足しています。分解洗浄後の確認結果を追記のうえ、再度ご提出をお願いします。",
    },
  ],
};
