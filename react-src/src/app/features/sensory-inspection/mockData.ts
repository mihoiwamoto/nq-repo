/* 工場ごとの見本で増やした点検対象（id に ~ が付く）でも引けるよう、id で引く見本は withTplFallback で包む（2026-10-07） */
import { withTplFallback } from "../../data/targetId";
/* 本番の API（check_status 0:未点検／1:点検済み／2:確認完了／9:差し戻し）に合わせて全部持つ（2026-10-08）。見本は未点検・点検済みだけ */
export type ProductStatus = "not_inspected" | "inspected" | "confirmed" | "rejected";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
  confirmed: "確認完了",
  rejected: "差し戻し",
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
  confirmed: "var(--semantic-status-success)",
  rejected: "var(--semantic-status-error)",
};

export type Product = {
  id: string;
  name: string;
  expiryDate: string;
  status: ProductStatus;
  date: string;
  inspectorName: string;
};

export const products: Product[] = [
  { id: "p1", name: "マンゴープリン　ストレート　1kg", expiryDate: "2025-07-24", status: "inspected", date: "2026-08-25", inspectorName: "佐藤健一" },
  { id: "p2", name: "厚焼き玉子（本）　500g", expiryDate: "2025-04-10", status: "inspected", date: "2026-08-25", inspectorName: "高橋美咲" },
  { id: "p3", name: "厚焼き玉子（本）　500g", expiryDate: "2025-04-12", status: "inspected", date: "2026-08-24", inspectorName: "渡辺真由" },
  { id: "p4", name: "厚焼き玉子（本）　500g", expiryDate: "2025-04-15", status: "not_inspected", date: "", inspectorName: "" },
];

export const CRITERIA = ["味", "形", "色", "食感", "香り", "とろみ"] as const;
export type Criterion = (typeof CRITERIA)[number];

export const CRITERION_TAG_COLORS: Record<Criterion, { bg: string; text: string }> = {
  味: { bg: "#ddf3e7", text: "#094" },
  形: { bg: "#eee", text: "#808080" },
  色: { bg: "#edf5ff", text: "#4b9ff8" },
  食感: { bg: "#feecec", text: "#f34949" },
  香り: { bg: "#fff4e6", text: "#e09a2f" },
  とろみ: { bg: "#fffbea", text: "#dcaa14" },
};

export type CriterionRecord = {
  score: number;
  reason: string;
};

export type ComparisonOption = "none" | "present";

export type SensoryRecord = {
  date: string;
  manufactureDate: string;
  comparison: ComparisonOption;
  comparisonManufactureDate: string;
  /** 比較製品の日付の種類（記録入力のプルダウン。無いときは製造日として扱う）。賞味期限のときは comparisonBestBeforeDate に入れる */
  comparisonDateType?: ComparisonDateType;
  comparisonBestBeforeDate?: string;
  scores: Record<Criterion, CriterionRecord | null>;
  /**
   * 項目ごとの入力時刻（"YYYY/MM/DD HH:mm"）。キーは "manufactureDate" /
   * "comparison" / "comparisonManufactureDate" と各評価項目名。
   * 記録画面で付けた時刻を確認画面・確認完了画面まで持ち越すために持たせる。
   */
  timestamps?: Record<string, string>;
};

export const recordsByProduct: Record<string, SensoryRecord | null> = withTplFallback({
  p1: null,
  p2: null,
  p3: null,
  p4: null,
});

export const ACTORS = [
  { id: "2103458", name: "西村あかり" },
  { id: "2118763", name: "橋本大輔" },
  { id: "2129045", name: "松井由紀" },
];

export type ScoreRow = {
  id: string;
  inspectorName: string;
  date: string;
  manufactureDate: string;
  comparison: ComparisonOption;
  comparisonManufactureDate: string;
  scores: Record<Criterion, CriterionRecord>;
};

export const pendingReviewProduct = {
  name: "マンゴープリン　ストレート　1kg",
  expiryDate: "2025-07-24",
};

export const pendingReviewScoreRows: ScoreRow[] = [
  {
    id: "r1",
    inspectorName: "佐藤健一",
    date: "2025-04-01",
    manufactureDate: "2025-03-24",
    comparison: "none",
    comparisonManufactureDate: "",
    scores: {
      味: { score: 5, reason: "" },
      形: { score: 5, reason: "" },
      色: { score: 5, reason: "" },
      食感: { score: 5, reason: "" },
      香り: { score: 5, reason: "" },
      とろみ: { score: 3, reason: "" },
    },
  },
  {
    id: "r2",
    inspectorName: "高橋美咲",
    date: "2025-04-01",
    manufactureDate: "2025-03-24",
    comparison: "present",
    comparisonManufactureDate: "2025-03-22",
    scores: {
      味: { score: 4, reason: "" },
      形: { score: 4, reason: "" },
      色: { score: 5, reason: "" },
      食感: { score: 4, reason: "" },
      香り: { score: 5, reason: "" },
      とろみ: { score: 3, reason: "" },
    },
  },
  {
    id: "r3",
    inspectorName: "渡辺真由",
    date: "2025-04-01",
    manufactureDate: "2025-03-24",
    comparison: "none",
    comparisonManufactureDate: "",
    scores: {
      味: { score: 4, reason: "" },
      形: { score: 4, reason: "" },
      色: { score: 3, reason: "" },
      食感: { score: 5, reason: "" },
      香り: { score: 3, reason: "" },
      とろみ: { score: 2, reason: "冷やし固まりが弱い" },
    },
  },
];

export type ScheduleComparisonOption = "unset" | "none" | "present";

export type ScheduledProduct = {
  productId: string;
  /** 検査する製品そのものの製造日（Ver.2.0 Figma 8481:165385／8481:165790） */
  manufactureDate: string;
  comparison: ScheduleComparisonOption;
  comparisonManufactureDate: string;
  /** 比較製品の賞味期限。比較製品「あり」のとき、管理画面と同じく 製造日／賞味期限 のどちらか 1 つをプルダウンで選んで入れる */
  comparisonBestBeforeDate: string;
  /** 比較製品の日付の種類（未選択は undefined。見本は製造日が入っていれば "manufactured"） */
  comparisonDateType?: ComparisonDateType;
};

export type ComparisonDateType = "manufactured" | "bestBefore";

/** 比較製品の日付の見出しと値（記録の確認画面・確認待ちで使う） */
export function comparisonDateOf(record: {
  comparisonDateType?: ComparisonDateType;
  comparisonManufactureDate: string;
  comparisonBestBeforeDate?: string;
}): { label: string; value: string; field: string } {
  return record.comparisonDateType === "bestBefore"
    ? { label: "比較製品賞味期限", value: record.comparisonBestBeforeDate ?? "", field: "comparisonBestBeforeDate" }
    : { label: "比較製品製造日", value: record.comparisonManufactureDate, field: "comparisonManufactureDate" };
}

export type SensoryScheduleEntry = {
  dateKey: string;
  products: ScheduledProduct[];
};

export const initialSensoryScheduleEntries: Record<string, SensoryScheduleEntry> = {
  "2025-04-01": {
    dateKey: "2025-04-01",
    products: [
      // Ver.2.0 Figma 8481:165385 の見本どおり：あり 2 件・なし・未設定
      // p1 は比較製品の日付を賞味期限にしている（記録入力 A1-4-2 の見本で「比較製品賞味期限」を見せるため。2026-10-09）
      { productId: "p1", manufactureDate: "2025-04-01", comparison: "present", comparisonDateType: "bestBefore", comparisonManufactureDate: "", comparisonBestBeforeDate: "2025-03-26" },
      { productId: "p2", manufactureDate: "2025-04-01", comparison: "present", comparisonManufactureDate: "2025-03-26", comparisonBestBeforeDate: "" },
      { productId: "p3", manufactureDate: "2025-04-01", comparison: "none", comparisonManufactureDate: "", comparisonBestBeforeDate: "" },
      { productId: "p4", manufactureDate: "2025-04-01", comparison: "unset", comparisonManufactureDate: "", comparisonBestBeforeDate: "" },
    ],
  },
};
