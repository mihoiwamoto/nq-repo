export type Machine = {
  id: string;
  name: string;
  displayFrom?: string;
  displayTo?: string;
  recordMetalDetector: boolean;
  recordXrayDetector: boolean;
  recordWeightChecker: boolean;
  recordSealing: boolean;
  mainPassProducts: string[];
};

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
    recordXrayDetector: true,
    recordWeightChecker: true,
    recordSealing: true,
    mainPassProducts: ["仕出しだし巻き玉子 冷凍"],
  },
  {
    id: "m2",
    name: "金探1号機（1kg以下の場合）",
    recordMetalDetector: true,
    recordXrayDetector: true,
    recordWeightChecker: true,
    recordSealing: false,
    mainPassProducts: ["茶碗蒸しの素（濃縮）"],
  },
  {
    id: "m3",
    name: "XXXXXXX",
    displayFrom: "2020-04-01",
    displayTo: "2020-04-30",
    recordMetalDetector: true,
    recordXrayDetector: false,
    recordWeightChecker: false,
    recordSealing: false,
    mainPassProducts: [],
  },
];
