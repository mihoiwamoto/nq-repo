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

/** 製品ごとの比較製品（本番の calendar の is_comparison：0＝なし・1＝あり・null＝未設定）と比較製品製造日 */
export type ComparisonSetting = {
  isComparison: 0 | 1 | null;
  manufacturedAt?: string;
};

export type ScheduleEntry = {
  dateKey: string;
  productIds: string[];
  /** キーは製品の id。無い製品は「未設定」 */
  comparisons?: Record<string, ComparisonSetting>;
};
