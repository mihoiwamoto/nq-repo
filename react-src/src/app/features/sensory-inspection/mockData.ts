export type ProductStatus = "not_inspected" | "inspected";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
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
  scores: Record<Criterion, CriterionRecord | null>;
  /**
   * 項目ごとの入力時刻（"YYYY/MM/DD HH:mm"）。キーは "manufactureDate" /
   * "comparison" / "comparisonManufactureDate" と各評価項目名。
   * 記録画面で付けた時刻を確認画面・確認完了画面まで持ち越すために持たせる。
   */
  timestamps?: Record<string, string>;
};

export const recordsByProduct: Record<string, SensoryRecord | null> = {
  p1: null,
  p2: null,
  p3: null,
  p4: null,
};

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
  comparison: ScheduleComparisonOption;
  comparisonManufactureDate: string;
};

export type SensoryScheduleEntry = {
  dateKey: string;
  products: ScheduledProduct[];
};

export const initialSensoryScheduleEntries: Record<string, SensoryScheduleEntry> = {
  "2025-04-01": {
    dateKey: "2025-04-01",
    products: [
      { productId: "p1", comparison: "present", comparisonManufactureDate: "2025-03-26" },
      { productId: "p2", comparison: "present", comparisonManufactureDate: "2025-03-26" },
    ],
  },
};
