import type { SensoryTargetProduct } from "./types";

const ALL_CRITERIA_RECORDED = { 味: true, 形: true, 色: true, 食感: true, 香り: true, とろみ: true };

export const SENSORY_TARGET_PRODUCTS: SensoryTargetProduct[] = [
  { id: "stp1", name: "マンゴープリン　ストレート　1kg", criteria: ALL_CRITERIA_RECORDED },
  { id: "stp2", name: "厚焼き玉子（本）　500g", criteria: ALL_CRITERIA_RECORDED },
  { id: "stp3", name: "たまごサラダ　200g", criteria: ALL_CRITERIA_RECORDED },
  { id: "stp4", name: "だし巻き玉子　厚焼き　300g", criteria: ALL_CRITERIA_RECORDED },
];

export const CORE_SYSTEM_PRODUCT_NAMES: string[] = [
  "仕出しだし巻き玉子 冷凍",
  "茶碗蒸しの素（濃縮）",
  "ふわとろスクランブルエッグ",
];
