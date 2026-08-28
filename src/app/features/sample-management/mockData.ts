export type SampleStatus = "not_inspected" | "inspected";

export type SampleTab = "today" | "storage";

export type SampleEntry = {
  id: string;
  productName: string;
  status: SampleStatus;
  tab: SampleTab;
  expiryDate: string;
  inspectorName?: string;
  inspectionDate?: string;
};

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
  not_inspected: "未点検",
  inspected: "点検済み",
};

export const SAMPLE_STATUS_COLORS: Record<SampleStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  inspected: "#DCAA14",
};

export const SAMPLE_ENTRIES: SampleEntry[] = [
  {
    id: "s1",
    productName: "仕出しだし巻き玉子 冷凍",
    status: "inspected",
    tab: "today",
    expiryDate: "2026-08-15",
    inspectorName: "佐藤健一",
    inspectionDate: "2026-08-25",
  },
  {
    id: "s2",
    productName: "厚焼き玉子（本）　500g",
    status: "inspected",
    tab: "today",
    expiryDate: "2026-08-10",
    inspectorName: "高橋和子",
    inspectionDate: "2026-08-25",
  },
  {
    id: "s3",
    productName: "スクランブルエッグ（冷凍）　350g",
    status: "inspected",
    tab: "today",
    expiryDate: "2026-08-20",
    inspectorName: "渡辺真由",
    inspectionDate: "2026-08-24",
  },
  {
    id: "s4",
    productName: "目玉焼きセット　500g",
    status: "not_inspected",
    tab: "today",
    expiryDate: "2026-08-25",
  },
];

export type SampleType = "product" | "portion";

export const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  product: "製品",
  portion: "小分け",
};

export const SAMPLE_UNITS = ["g", "kg", "個", "パック", "本"];

export const SAMPLE_STORAGE_LOCATIONS = ["冷蔵庫A", "冷凍庫B", "常温倉庫"];

export type SampleConfirmState = {
  inspectorName: string;
  inspectionDate: string;
  manufactureDate: string;
  sampleType: SampleType;
  quantity: string;
  unit: string;
  storageLocation: string;
  remarks: string;
  timestamp: string;
};

export type StoredSample = {
  id: string;
  productName: string;
  manufactureDate: string;
  expiryDate: string;
  destructionTarget: boolean;
  inspectorName: string;
  inspectionDate: string;
  sampleType: SampleType;
  quantity: string;
  unit: string;
  storageLocation: string;
  remarks: string;
};

export const STORED_SAMPLES: StoredSample[] = [
  {
    id: "st1",
    productName: "仕出しだし巻き玉子 冷凍",
    manufactureDate: "2026-02-28",
    expiryDate: "2026-03-31",
    destructionTarget: false,
    inspectorName: "高橋和子",
    inspectionDate: "2026-02-28",
    sampleType: "product",
    quantity: "1",
    unit: "パック",
    storageLocation: "冷凍庫B",
    remarks: "",
  },
  {
    id: "st2",
    productName: "厚焼き玉子（本）　500g",
    manufactureDate: "2026-02-10",
    expiryDate: "2026-03-13",
    destructionTarget: true,
    inspectorName: "佐藤健一",
    inspectionDate: "2026-02-10",
    sampleType: "product",
    quantity: "1",
    unit: "本",
    storageLocation: "冷蔵庫A",
    remarks: "",
  },
  {
    id: "st3",
    productName: "オムレツミックス　300g",
    manufactureDate: "2026-02-09",
    expiryDate: "2026-03-12",
    destructionTarget: true,
    inspectorName: "渡辺真由",
    inspectionDate: "2026-02-09",
    sampleType: "portion",
    quantity: "2",
    unit: "個",
    storageLocation: "常温倉庫",
    remarks: "特記事項なし",
  },
  {
    id: "st4",
    productName: "黄身入りソーセージ　1kg",
    manufactureDate: "2026-01-20",
    expiryDate: "2026-04-20",
    destructionTarget: false,
    inspectorName: "小林誠司",
    inspectionDate: "2026-01-20",
    sampleType: "product",
    quantity: "1",
    unit: "kg",
    storageLocation: "冷凍庫B",
    remarks: "",
  },
];

export type DiscardReason = "expired" | "other";

export const DISCARD_REASON_LABELS: Record<DiscardReason, string> = {
  expired: "賞味期限切れ",
  other: "その他",
};

export type SampleReviewComment = {
  id: string;
  authorName: string;
  timestamp: string;
  body: string;
};

export type SampleReviewDetail = {
  productName: string;
  expiryDate: string;
  inspectorName: string;
  inspectionDate: string;
  manufactureDate: string;
  sampleType: SampleType;
  quantity: string;
  unit: string;
  storageLocation: string;
  remarks: string;
  timestamp: string;
  comments: SampleReviewComment[];
};

export const SAMPLE_REVIEW_DETAILS: Record<string, SampleReviewDetail> = {
  s1: {
    productName: "仕出しだし巻き玉子 冷凍",
    expiryDate: "2026-08-15",
    inspectorName: "佐藤健一",
    inspectionDate: "2026-08-25",
    manufactureDate: "2026-08-22",
    sampleType: "product",
    quantity: "1",
    unit: "パック",
    storageLocation: "冷凍庫B",
    remarks: "良好",
    timestamp: "2026/08/25 09:20",
    comments: [],
  },
  s2: {
    productName: "厚焼き玉子（本）　500g",
    expiryDate: "2026-08-10",
    inspectorName: "高橋和子",
    inspectionDate: "2026-08-25",
    manufactureDate: "2026-08-01",
    sampleType: "product",
    quantity: "1",
    unit: "本",
    storageLocation: "冷蔵庫A",
    remarks: "外観・品質問題なし",
    timestamp: "2026/08/25 10:15",
    comments: [],
  },
  s3: {
    productName: "スクランブルエッグ（冷凍）　350g",
    expiryDate: "2026-08-20",
    inspectorName: "渡辺真由",
    inspectionDate: "2026-08-24",
    manufactureDate: "2026-08-15",
    sampleType: "portion",
    quantity: "2",
    unit: "個",
    storageLocation: "冷凍庫B",
    remarks: "品質確認完了",
    timestamp: "2026/08/24 14:30",
    comments: [],
  },
};
