import type { MetalDetectorUnit } from "./types";

export { CANDIDATE_PRODUCTS } from "../metal-xray-detection/mockData";

export const METAL_DETECTOR_UNITS: MetalDetectorUnit[] = [
  {
    id: "u1",
    name: "金属探知機1号機",
    settings: [
      {
        id: "s1",
        productName: "仕出しだし巻き玉子 冷凍",
        settingNumber: "標準",
        fe: "1.5",
        sus: "2.0",
      },
    ],
  },
  {
    id: "u2",
    name: "金属探知機2号機",
    settings: [],
  },
  {
    id: "u3",
    name: "金属探知機3号機",
    settings: [
      {
        id: "s2",
        productName: "茶碗蒸しの素（濃縮）",
        settingNumber: "1",
        fe: "1.2",
        sus: "1.8",
      },
      {
        id: "s3",
        productName: "ふわとろスクランブルエッグ",
        settingNumber: "2",
        fe: "1.0",
        sus: "0",
      },
    ],
  },
];
