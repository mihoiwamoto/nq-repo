export type Machine = {
  id: string;
  name: string;
  displayFrom?: string;
  displayTo?: string;
  recordMetalDetector: boolean;
  metalDetectorName?: string;
  recordXrayDetector: boolean;
  xrayDetectorName?: string;
  recordWeightChecker: boolean;
  weightCheckerName?: string;
  recordSealing: boolean;
  sealingName?: string;
  mainPassProducts: string[];
};

export const METAL_DETECTORS = [
  "メタロジッカ MD100",
  "メタロジッカ MD200",
  "ニッキーデテクター ND-50",
];

export const XRAY_DETECTORS = [
  "X-Ray Pro 500",
  "X-Ray Pro 1000",
  "X-Ray Lite 300",
];

export const WEIGHT_CHECKERS = [
  "WeightCheck WC-100",
  "WeightCheck WC-200",
  "WeightPro WP-50",
];

export const SEALING_MACHINES = [
  "Sealer SP-100",
  "Sealer SP-200",
  "AutoSeal AS-50",
];

export const CANDIDATE_PRODUCTS = [
  "仕出しだし巻き玉子 冷凍",
  "茶碗蒸しの素（濃縮）",
  "ふわとろスクランブルエッグ",
  "玉子と野菜のテリーヌ",
  "フレンチトーストベース",
  "マンゴープリン ストレート 1kg",
  "抹茶アイス 業務用",
  "ティラミスケーキ 冷凍",
  "ステーキ用牛肉 冷凍 300g",
  "厚焼き玉子 プレーン 1kg",
  "かぼちゃサラダ 業務用 500g",
  "鶏つくね串 タレ付 冷凍",
  "白身魚フライ 冷凍 20枚",
  "ミルクプリン ストレート 1kg",
];

export const MACHINES: Machine[] = [
  {
    id: "m1",
    name: "金探1号機（500g以下の場合）",
    recordMetalDetector: true,
    metalDetectorName: "メタロジッカ MD100",
    recordXrayDetector: true,
    xrayDetectorName: "X-Ray Pro 500",
    recordWeightChecker: true,
    weightCheckerName: "WeightCheck WC-100",
    recordSealing: true,
    sealingName: "Sealer SP-100",
    mainPassProducts: ["仕出しだし巻き玉子 冷凍"],
  },
  {
    id: "m2",
    name: "金探1号機（1kg以下の場合）",
    recordMetalDetector: true,
    metalDetectorName: "メタロジッカ MD200",
    recordXrayDetector: true,
    xrayDetectorName: "X-Ray Pro 1000",
    recordWeightChecker: true,
    weightCheckerName: "WeightCheck WC-200",
    recordSealing: false,
    mainPassProducts: ["茶碗蒸しの素（濃縮）"],
  },
  {
    id: "m3",
    name: "XXXXXXX",
    displayFrom: "2026-09-01",
    displayTo: "2026-09-30",
    recordMetalDetector: true,
    metalDetectorName: "メタロジッカ MD100",
    recordXrayDetector: false,
    recordWeightChecker: false,
    recordSealing: false,
    mainPassProducts: [],
  },
];
