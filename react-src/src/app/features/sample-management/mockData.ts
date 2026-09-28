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
  /**
   * 製造日・ロットNo. は管理画面で「記載する」と設定した製品だけに入る任意項目。
   * 未設定の製品は値を持たず、一覧カードにもその行を出さない。
   */
  manufactureDate?: string;
  lotNumber?: string;
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
    manufactureDate: "2026-08-22",
    lotNumber: "SSDLODDLDA",
  },
  {
    id: "s2",
    productName: "厚焼き玉子（本）　500g",
    status: "inspected",
    tab: "today",
    expiryDate: "2026-08-10",
    inspectorName: "高橋和子",
    inspectionDate: "2026-08-25",
    manufactureDate: "2026-08-01",
    lotNumber: "SSDLODDLDB",
  },
  {
    id: "s3",
    productName: "スクランブルエッグ（冷凍）　350g",
    status: "inspected",
    tab: "today",
    expiryDate: "2026-08-20",
    inspectorName: "渡辺真由",
    inspectionDate: "2026-08-24",
    // ロットNo. だけ「記載する」設定にしている製品
    lotNumber: "BASKNDXX",
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
  /**
   * 項目ごとの入力時刻（"YYYY/MM/DD HH:mm"）。キーは "manufactureDate" /
   * "sampleType" / "quantity" / "unit" / "storageLocation"。
   * 記録画面で付けた時刻を確認画面まで持ち越すために持たせる。
   */
  timestamps?: Record<string, string>;
};

export type StoredSample = {
  id: string;
  productName: string;
  manufactureDate: string;
  expiryDate: string;
  /** 管理画面で「記載する」と設定した製品だけに入る任意項目 */
  lotNumber?: string;
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
    lotNumber: "SSDLODDLDA",
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
    lotNumber: "SSDLODDLDB",
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
    lotNumber: "KMSSG1KG",
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
  /** 管理画面で「記載する」と設定した製品だけに入る任意項目 */
  lotNumber?: string;
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
    lotNumber: "SSDLODDLDA",
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
    lotNumber: "SSDLODDLDB",
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
    lotNumber: "BASKNDXX",
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
