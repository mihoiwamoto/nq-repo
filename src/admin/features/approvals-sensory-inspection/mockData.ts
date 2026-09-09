import type { SensoryApprovalRecord } from "./types";

const CRITERIA_ORDER = ["味", "形", "色", "食感", "香り", "とろみ"] as const;

function criterionTimestamps(startTime: string) {
  const [datePart, timePart] = startTime.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  return CRITERIA_ORDER.map((_, i) => {
    const totalMinutes = h * 60 + m + i * 5;
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const mm = String(totalMinutes % 60).padStart(2, "0");
    return `${datePart} ${hh}:${mm}`;
  });
}

function fullScores(base: Record<string, number>, startTime: string) {
  const timestamps = criterionTimestamps(startTime);
  return Object.fromEntries(
    CRITERIA_ORDER.map((criterion, i) => [
      criterion,
      { score: base[criterion], timestamp: timestamps[i] },
    ])
  ) as Record<(typeof CRITERIA_ORDER)[number], { score: number; timestamp: string }>;
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
        scores: fullScores({ 味: 5, 形: 5, 色: 5, 食感: 5, 香り: 5, とろみ: 5 }, "2025/04/01 09:10"),
      },
      {
        id: "ase2",
        inspectorName: "橋本大輔",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: true,
        comparisonManufactureDate: "2025-03-22",
        scores: fullScores({ 味: 4, 形: 4, 色: 5, 食感: 4, 香り: 5, とろみ: 4 }, "2025/04/01 09:40"),
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
          味: { score: 4, timestamp: "2025/04/01 10:10" },
          形: { score: 4, timestamp: "2025/04/01 10:15" },
          色: { score: 3, timestamp: "2025/04/01 10:20" },
          食感: { score: 5, timestamp: "2025/04/01 10:25" },
          香り: { score: 3, timestamp: "2025/04/01 10:30" },
          とろみ: { score: 2, reason: "冷やし固まりが弱い", timestamp: "2025/04/01 10:35" },
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
        scores: fullScores({ 味: 5, 形: 4, 色: 5, 食感: 5, 香り: 4, とろみ: 5 }, "2025/04/01 08:50"),
      },
    ],
  },
];
