export const CRITERIA = ["味", "形", "色", "食感", "香り", "とろみ"] as const;
export type Criterion = (typeof CRITERIA)[number];

export const CRITERION_STYLES: Record<Criterion, { bg: string; text: string }> = {
  味: { bg: "#ddf3e7", text: "#094" },
  形: { bg: "#eee", text: "#808080" },
  色: { bg: "#edf5ff", text: "#4b9ff8" },
  食感: { bg: "#feecec", text: "#f34949" },
  香り: { bg: "#fff4e6", text: "#e09a2f" },
  とろみ: { bg: "#fffbea", text: "#dcaa14" },
};

export type SensoryTargetProduct = {
  id: string;
  name: string;
  criteria: Record<Criterion, boolean>;
};

/** 比較製品の日付の種類（「あり」のときにプルダウンで選ぶ。Ver.2.0 Figma 8465:152142） */
export type ComparisonDateType = "manufactured" | "bestBefore";

export const COMPARISON_DATE_LABELS: Record<ComparisonDateType, string> = {
  manufactured: "比較製品製造日",
  bestBefore: "比較製品賞味期限",
};

/** 製品ごとの比較製品（本番の calendar の is_comparison：0＝なし・1＝あり・null＝未設定）と、比較製品製造日／比較製品賞味期限のどちらか 1 つ */
export type ComparisonSetting = {
  isComparison: 0 | 1 | null;
  /** 検査対象製品そのものの製造日（※必須。比較製品の上に出す） */
  productManufacturedAt?: string;
  dateType?: ComparisonDateType;
  manufacturedAt?: string;
  bestBeforeAt?: string;
};

export type ScheduleEntry = {
  dateKey: string;
  productIds: string[];
  /** キーは製品の id。無い製品は「未設定」 */
  comparisons?: Record<string, ComparisonSetting>;
};
