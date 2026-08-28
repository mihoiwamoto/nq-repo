export type PointStatus = "not_inspected" | "inspected" | "confirmed";

export type WaterPoint = {
  id: string;
  name: string;
  status: PointStatus;
  inspectorName?: string;
  inspectionDate?: string;
};

export const POINT_STATUS_LABELS: Record<PointStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
  confirmed: "確認完了",
};

export const POINT_STATUS_COLORS: Record<PointStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
  confirmed: "var(--semantic-status-success)",
};

export const points: WaterPoint[] = [
  { id: "wp1", name: "点検場所A", status: "inspected", inspectorName: "山田太郎", inspectionDate: "2026-08-25" },
  { id: "wp2", name: "点検場所B", status: "confirmed", inspectorName: "鈴木花子", inspectionDate: "2026-08-25" },
  { id: "wp3", name: "点検場所C", status: "inspected", inspectorName: "佐藤健一", inspectionDate: "2026-08-24" },
  { id: "wp4", name: "点検場所D", status: "inspected", inspectorName: "渡辺真由", inspectionDate: "2026-08-23" },
];

export const POINT_INSPECTED_AT: Record<string, string> = {
  wp1: "8.25 10:32",
  wp2: "8.25 11:15",
  wp3: "8.24 14:20",
  wp4: "8.23 09:45",
};

export type CheckStatus = "ok" | "ng";

export type CheckItem = {
  label: string;
  status: CheckStatus;
  cause?: string;
  action?: string;
};

export const ACTION_OPTIONS = ["業者に依頼", "塩素補充", "その他"] as const;

export type ToggleItem = {
  label: string;
  checked: boolean;
};

export type WaterInspectionRecord = {
  id: string;
  inspector: string;
  location: string;
  date: string;
  time: string;
  checks: CheckItem[];
  phValue: string;
  residualChlorine: string;
  chlorineToggle: ToggleItem;
  uvOperatingHours: string;
  uvToggle: ToggleItem;
  uvIndicatorLight: string;
  errorIndicatorLight: string;
};

function okChecks(): CheckItem[] {
  return [
    { label: "味", status: "ok" },
    { label: "臭い", status: "ok" },
    { label: "色", status: "ok" },
    { label: "濁り", status: "ok" },
    { label: "異物", status: "ok" },
  ];
}

export const recordsByPoint: Record<string, WaterInspectionRecord[]> = {
  wp1: [
    {
      id: "wp1-r3",
      inspector: "山田太郎",
      location: "給湯室",
      date: "2026/08/25",
      time: "10:32",
      checks: okChecks(),
      phValue: "6.4",
      residualChlorine: "0.0",
      chlorineToggle: { label: "塩素補充", checked: false },
      uvOperatingHours: "000.0",
      uvToggle: { label: "UV殺菌灯交換", checked: false },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
    {
      id: "wp1-r2",
      inspector: "山田太郎",
      location: "給湯室",
      date: "2025/03/27",
      time: "09:00",
      checks: okChecks(),
      phValue: "6.7",
      residualChlorine: "0.0",
      chlorineToggle: { label: "塩素補充", checked: false },
      uvOperatingHours: "000.0",
      uvToggle: { label: "UV殺菌灯交換", checked: false },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
    {
      id: "wp1-r1",
      inspector: "山田太郎",
      location: "給湯室",
      date: "2025/03/24",
      time: "10:32",
      checks: [
        { label: "味", status: "ok" },
        {
          label: "臭い",
          status: "ng",
          cause: "不明",
          action: "テキストテキストテキストテキスト",
        },
        { label: "色", status: "ok" },
        { label: "濁り", status: "ok" },
        { label: "異物", status: "ok" },
      ],
      phValue: "6.5",
      residualChlorine: "0.3",
      chlorineToggle: { label: "塩素補充", checked: true },
      uvOperatingHours: "4,000",
      uvToggle: { label: "UV殺菌灯交換", checked: true },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
  ],
  wp2: [
    {
      id: "wp2-r2",
      inspector: "鈴木花子",
      location: "厨房",
      date: "2026/08/25",
      time: "11:15",
      checks: okChecks(),
      phValue: "6.9",
      residualChlorine: "0.0",
      chlorineToggle: { label: "塩素補充", checked: false },
      uvOperatingHours: "000.0",
      uvToggle: { label: "UV殺菌灯交換", checked: false },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
    {
      id: "wp2-r1",
      inspector: "鈴木花子",
      location: "厨房",
      date: "2025/03/24",
      time: "10:32",
      checks: okChecks(),
      phValue: "6.8",
      residualChlorine: "0.4",
      chlorineToggle: { label: "塩素補充", checked: false },
      uvOperatingHours: "3,200",
      uvToggle: { label: "UV殺菌灯交換", checked: false },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
  ],
  wp3: [
    {
      id: "wp3-r1",
      inspector: "佐藤健一",
      location: "洗浄室",
      date: "2026/08/24",
      time: "14:20",
      checks: okChecks(),
      phValue: "6.6",
      residualChlorine: "0.2",
      chlorineToggle: { label: "塩素補充", checked: false },
      uvOperatingHours: "1,500",
      uvToggle: { label: "UV殺菌灯交換", checked: false },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
  ],
  wp4: [
    {
      id: "wp4-r1",
      inspector: "渡辺真由",
      location: "実験室",
      date: "2026/08/23",
      time: "09:45",
      checks: okChecks(),
      phValue: "6.7",
      residualChlorine: "0.1",
      chlorineToggle: { label: "塩素補充", checked: false },
      uvOperatingHours: "2,100",
      uvToggle: { label: "UV殺菌灯交換", checked: false },
      uvIndicatorLight: "点灯",
      errorIndicatorLight: "消灯",
    },
  ],
};
