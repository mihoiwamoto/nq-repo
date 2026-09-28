export type WaterInspectionToggleKey =
  | "taste"
  | "smell"
  | "color"
  | "turbidity"
  | "foreignMatter"
  | "ph"
  | "chlorine"
  | "uvOperatingHours"
  | "uvIndicatorLight"
  | "abnormalDetectionLight";

export type WaterInspectionPoint = {
  id: string;
  factoryId: string;
  name: string;
  displayFrom?: string;
  displayTo?: string;
  checks: Record<WaterInspectionToggleKey, boolean>;
  uvAlertHours: string;
};

export type WaterInspectionFormField =
  | { type: "toggle"; key: WaterInspectionToggleKey; label: string }
  | { type: "text"; key: "uvAlertHours"; label: string };

export const WATER_INSPECTION_FORM_FIELDS: WaterInspectionFormField[] = [
  { type: "toggle", key: "taste", label: "味" },
  { type: "toggle", key: "smell", label: "臭い" },
  { type: "toggle", key: "color", label: "色" },
  { type: "toggle", key: "turbidity", label: "濁り" },
  { type: "toggle", key: "foreignMatter", label: "異物" },
  { type: "toggle", key: "ph", label: "ph" },
  { type: "toggle", key: "chlorine", label: "残留塩素濃度" },
  { type: "toggle", key: "uvOperatingHours", label: "UV殺菌灯稼働時間（h）" },
  { type: "text", key: "uvAlertHours", label: "UV殺菌灯表示アラート時間(h)" },
  { type: "toggle", key: "uvIndicatorLight", label: "UV表示灯" },
  { type: "toggle", key: "abnormalDetectionLight", label: "異常検出灯" },
];
