export type SampleTargetProduct = {
  id: string;
  name: string;
  /**
   * 製造日・ロットNo. は管理画面で「記載する」と設定した製品だけに入る任意項目。
   * 値が無い製品はその行ごと表示しない。
   */
  manufactureDate?: string;
  lotNumber?: string;
};

export const SAMPLE_TARGET_PRODUCTS: SampleTargetProduct[] = [
  {
    id: "sp1",
    name: "仕出しだし巻き玉子 冷凍",
    manufactureDate: "2025-03-26",
    lotNumber: "AXCDFGVB",
  },
  {
    id: "sp2",
    name: "茶碗蒸しの素（濃縮）",
    manufactureDate: "2025-03-23",
    lotNumber: "CXSKDML",
  },
  {
    id: "sp3",
    name: "ふわとろスクランブルエッグ",
    manufactureDate: "2025-03-22",
    lotNumber: "CKDJHKDK",
  },
  // ロットNo. だけ「記載する」設定にしている製品
  { id: "sp4", name: "玉子と野菜のテリーヌ", lotNumber: "BASKNDXX" },
  // どちらも「記載する」設定にしていない製品
  { id: "sp5", name: "フレンチトーストベース" },
];

export const CORE_SYSTEM_PRODUCT_NAMES: string[] = [
  "マンゴープリン　ストレート　1kg",
  "ふわとろスクランブルエッグ",
  "玉子と野菜のテリーヌ",
];
