export type PostStatus = "not_inspected" | "inspected";

export type Post = {
  id: string;
  name: string;
  status: PostStatus;
  date: string;
  inspectorName: string;
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
};

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
};

export const posts: Post[] = [
  { id: "additive", name: "添加物", status: "inspected", date: "2026-08-25", inspectorName: "高橋和子" },
  { id: "pudding", name: "プリン", status: "inspected", date: "2026-08-25", inspectorName: "佐藤健一" },
  { id: "topping", name: "トッピング", status: "inspected", date: "2026-08-24", inspectorName: "渡辺真由" },
  { id: "ice", name: "アイス", status: "not_inspected", date: "", inspectorName: "" },
  { id: "catalana", name: "カタラーナ", status: "not_inspected", date: "", inspectorName: "" },
];

export type ActionCheck = "ok" | "ng" | null;

export const ACTION_OPTIONS = ["電池交換", "修理", "その他"] as const;
export type ActionOption = (typeof ACTION_OPTIONS)[number];

export const WEIGHT_ISSUE_OPTIONS = ["故障", "その他"] as const;
export type WeightIssueOption = (typeof WEIGHT_ISSUE_OPTIONS)[number];

export type ScaleRecord = {
  actionCheck: ActionCheck;
  cause: string;
  actionType: ActionOption | null;
  levelCheck: boolean;
  dirtCheck: boolean;
  displayValue: string;
  weightCause: WeightIssueOption | null;
  remarks: string;
};

export type Scale = {
  id: string;
  label: string;
  serialNumber: string;
  referenceWeight: number;
  record: ScaleRecord | null;
  skipped: boolean;
  skipReason: string;
};

export const CIRCLED_NUMBERS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

export const CRITERIA_TOLERANCE = 2;

export const scalesByPost: Record<string, Scale[]> = {
  additive: [
    { id: "s1", label: "添加物①", serialNumber: "ABC-223456", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s2", label: "添加物②", serialNumber: "ABC-223457", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
  ],
  pudding: [
    { id: "s1", label: "プリン①", serialNumber: "ABC-123456", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s2", label: "プリン②", serialNumber: "ABC-123457", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s3", label: "プリン③", serialNumber: "ABC-123458", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s4", label: "プリン④", serialNumber: "ABC-123459", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s5", label: "プリン⑤", serialNumber: "ABC-123460", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s6", label: "プリン⑥", serialNumber: "ABC-123461", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
  ],
  topping: [
    { id: "s1", label: "トッピング①", serialNumber: "ABC-323456", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s2", label: "トッピング②", serialNumber: "ABC-323457", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
  ],
  ice: [
    { id: "s1", label: "アイス①", serialNumber: "ABC-423456", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s2", label: "アイス②", serialNumber: "ABC-423457", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
  ],
  catalana: [
    { id: "s1", label: "カタラーナ①", serialNumber: "ABC-523456", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
    { id: "s2", label: "カタラーナ②", serialNumber: "ABC-523457", referenceWeight: 100, record: null, skipped: false, skipReason: "" },
  ],
};

export type SpareScale = {
  id: string;
  label: string;
  serialNumber: string;
  referenceWeight: number;
};

export const spareScales: SpareScale[] = CIRCLED_NUMBERS.slice(0, 7).map((mark, index) => ({
  id: `spare${index + 1}`,
  label: `予備${mark}`,
  serialNumber: `SPR-00000${index + 1}`,
  referenceWeight: 100,
}));

export const pendingReviewPost = {
  date: "2025-03-24",
  inspectorName: "高橋和子",
};

export const pendingReviewScales: Scale[] = [
  {
    id: "s1",
    label: "添加物①",
    serialNumber: "ABC-223456",
    referenceWeight: 100,
    skipped: false,
    skipReason: "",
    record: {
      actionCheck: "ok",
      cause: "",
      actionType: null,
      levelCheck: true,
      dirtCheck: true,
      displayValue: "100",
      weightCause: null,
      remarks: "",
    },
  },
  {
    id: "s2",
    label: "添加物②",
    serialNumber: "ABC-223457",
    referenceWeight: 100,
    skipped: false,
    skipReason: "",
    record: {
      actionCheck: "ng",
      cause: "表示が点灯しない",
      actionType: "修理",
      levelCheck: false,
      dirtCheck: false,
      displayValue: "",
      weightCause: null,
      remarks: "修理担当者へ連絡済み",
    },
  },
];

export type ScaleRepairStatus = "action_needed" | "no_repair" | "repairing" | "done";

export const SCALE_REPAIR_STATUS_LABELS: Record<ScaleRepairStatus, string> = {
  action_needed: "要対応",
  no_repair: "修理しない",
  repairing: "修理中",
  done: "修理完了",
};

export const SCALE_REPAIR_STATUS_COLORS: Record<ScaleRepairStatus, string> = {
  action_needed: "var(--semantic-status-error)",
  no_repair: "var(--semantic-text-secondary)",
  repairing: "var(--semantic-status-caution)",
  done: "var(--semantic-status-success)",
};

export const SCALE_REPAIR_STATUS_NEXT_OPTIONS: Record<ScaleRepairStatus, ScaleRepairStatus[]> = {
  action_needed: ["action_needed", "repairing", "no_repair"],
  repairing: ["repairing", "done"],
  no_repair: ["no_repair"],
  done: ["done"],
};
