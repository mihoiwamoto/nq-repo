import type { SensoryApprovalRecord } from "./types";

function fullScores(base: Record<string, number>) {
  return {
    味: { score: base.味 },
    形: { score: base.形 },
    色: { score: base.色 },
    食感: { score: base.食感 },
    香り: { score: base.香り },
    とろみ: { score: base.とろみ },
  };
}

export const sensoryApprovalRecords: SensoryApprovalRecord[] = [
  {
    id: "asr1",
    date: "2025-04-01",
    productName: "マンゴープリン　ストレート　1kg",
    manufactureDate: "2025-03-24",
    expiryDate: "2025-07-24",
    confirmer: "山本真理",
    approvalStatus: "pending",
    scoreEntries: [
      {
        id: "ase1",
        inspectorName: "西村あかり",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: false,
        scores: fullScores({ 味: 5, 形: 5, 色: 5, 食感: 5, 香り: 5, とろみ: 5 }),
      },
      {
        id: "ase2",
        inspectorName: "橋本大輔",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: true,
        comparisonManufactureDate: "2025-03-22",
        scores: fullScores({ 味: 4, 形: 4, 色: 5, 食感: 4, 香り: 5, とろみ: 4 }),
      },
    ],
  },
  {
    id: "asr2",
    date: "2025-04-01",
    productName: "厚焼き玉子（本）　500g",
    manufactureDate: "2025-03-24",
    expiryDate: "2025-04-10",
    confirmer: "山本真理",
    approvalStatus: "pending",
    scoreEntries: [
      {
        id: "ase3",
        inspectorName: "松井由紀",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: false,
        scores: {
          味: { score: 4 },
          形: { score: 4 },
          色: { score: 3 },
          食感: { score: 5 },
          香り: { score: 3 },
          とろみ: { score: 2, reason: "冷やし固まりが弱い" },
        },
      },
    ],
  },
  {
    id: "asr3",
    date: "2025-04-01",
    productName: "たまごサラダ　200g",
    manufactureDate: "2025-03-25",
    expiryDate: "2025-04-08",
    confirmer: "加藤由美",
    approvalStatus: "pending",
    scoreEntries: [
      {
        id: "ase4",
        inspectorName: "西村あかり",
        confirmerName: "加藤由美",
        date: "2025-04-01",
        hasComparisonProduct: false,
        scores: fullScores({ 味: 5, 形: 4, 色: 5, 食感: 5, 香り: 4, とろみ: 5 }),
      },
    ],
  },
];
