import type { XrayDetectorUnit } from "./types";

export { CANDIDATE_PRODUCTS } from "../metal-xray-detection/mockData";

export const XRAY_DETECTOR_UNITS: XrayDetectorUnit[] = [
  {
    id: "xu1",
    name: "X線探知機1号機",
    settings: [
      {
        id: "xs1",
        productName: "仕出しだし巻き玉子 冷凍",
        settingNumber: "標準",
        susBall: "1.5",
        susWire: "0",
        glassBall: "2.0",
        ceramic: "0",
        rubberBall: "3.0",
      },
    ],
  },
  {
    id: "xu2",
    name: "X線探知機2号機",
    settings: [],
  },
  {
    id: "xu3",
    name: "X線探知機3号機",
    settings: [
      {
        id: "xs2",
        productName: "茶碗蒸しの素（濃縮）",
        settingNumber: "1",
        susBall: "1.2",
        susWire: "1.0",
        glassBall: "0",
        ceramic: "2.5",
        rubberBall: "0",
      },
    ],
  },
];
