export type Machine = {
  id: string;
  name: string;
  displayFrom?: string;
  displayTo?: string;
  recordMetalDetector: boolean;
  metalDetectorUnit?: string;
  recordXrayDetector: boolean;
  xrayDetectorUnit?: string;
  recordWeightChecker: boolean;
  weightCheckerUnit?: string;
  recordSealing: boolean;
  mainPassProducts: string[];
};

export const METAL_DETECTOR_UNITS = ["金属探知機1号機", "金属探知機2号機", "金属探知機3号機"];
export const XRAY_DETECTOR_UNITS = ["X線探知機1号機", "X線探知機2号機", "X線探知機3号機"];
export const WEIGHT_CHECKER_UNITS = ["ウェイトチェッカー1号機", "ウェイトチェッカー2号機", "ウェイトチェッカー3号機"];

export const CANDIDATE_PRODUCTS = [
  "仕出しだし巻き玉子 冷凍",
  "茶碗蒸しの素（濃縮）",
  "ふわとろスクランブルエッグ",
  "玉子と野菜のテリーヌ",
  "フレンチトーストベース",
];

export const MACHINES: Machine[] = [
  {
    id: "m1",
    name: "金探1号機（500g以下の場合）",
    recordMetalDetector: true,
    metalDetectorUnit: "金属探知機1号機",
    recordXrayDetector: true,
    xrayDetectorUnit: "X線探知機1号機",
    recordWeightChecker: true,
    weightCheckerUnit: "ウェイトチェッカー1号機",
    recordSealing: true,
    mainPassProducts: ["仕出しだし巻き玉子 冷凍"],
  },
  {
    id: "m2",
    name: "金探1号機（1kg以下の場合）",
    recordMetalDetector: true,
    metalDetectorUnit: "金属探知機2号機",
    recordXrayDetector: true,
    xrayDetectorUnit: "X線探知機2号機",
    recordWeightChecker: true,
    weightCheckerUnit: "ウェイトチェッカー2号機",
    recordSealing: false,
    mainPassProducts: ["茶碗蒸しの素（濃縮）"],
  },
  {
    id: "m3",
    name: "XXXXXXX",
    displayFrom: "2020-04-01",
    displayTo: "2020-04-30",
    recordMetalDetector: true,
    metalDetectorUnit: "金属探知機3号機",
    recordXrayDetector: false,
    recordWeightChecker: false,
    recordSealing: false,
    mainPassProducts: [],
  },
];
