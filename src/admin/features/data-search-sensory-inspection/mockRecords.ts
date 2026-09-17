import { stepTimestamps } from "../../utils/recordTimestamps";
import { CRITERIA } from "./types";
import type { CriterionScore, Criterion, SensoryRecord } from "./types";

/**
 * 点数と、アプリで入力した時刻。時刻はモックに無いので実施日から組み立てる
 * （上の項目から順に 5 分ずつずらす）。
 */
function fullScores(base: Record<string, number>, date: string): Record<Criterion, CriterionScore> {
  const timestamps = stepTimestamps(date, CRITERIA.length, { start: "10:10" });
  return Object.fromEntries(
    CRITERIA.map((criterion, i) => [criterion, { score: base[criterion], timestamp: timestamps[i] }]),
  ) as Record<Criterion, CriterionScore>;
}

export const sensoryRecords: SensoryRecord[] = [
  {
    id: "sr1",
    date: "2025-04-01",
    productName: "マンゴープリン　ストレート　1kg",
    manufactureDate: "2025-03-24",
    expiryDate: "2025-07-24",
    confirmer: "山本真理",
    approvalStatus: "pending",
    comments: [
      {
        id: "c1",
        author: "鈴木修",
        timestamp: "2026.08.19 10:39",
        text: "検索条件を確認しました。問題ありません。",
      },
      {
        id: "c2",
        author: "山田花子",
        timestamp: "2026.08.23 15:45",
        text: "データ抽出の期間を再度ご確認ください。",
      },
    ],
    scoreEntries: [
      {
        id: "se1",
        inspectorName: "西村あかり",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: false,
        scores: fullScores({ 味: 5, 形: 5, 色: 5, 食感: 5, 香り: 5, とろみ: 5 }, "2025-04-01"),
      },
      {
        id: "se2",
        inspectorName: "橋本大輔",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: true,
        comparisonManufactureDate: "2025-03-22",
        scores: fullScores({ 味: 4, 形: 4, 色: 5, 食感: 4, 香り: 5, とろみ: 4 }, "2025-04-01"),
      },
    ],
  },
  {
    id: "sr2",
    date: "2025-04-01",
    productName: "厚焼き玉子（本）　500g",
    manufactureDate: "2025-03-24",
    expiryDate: "2025-04-10",
    confirmer: "山本真理",
    approvalStatus: "pending",
    scoreEntries: [
      {
        id: "se3",
        inspectorName: "松井由紀",
        confirmerName: "山本真理",
        date: "2025-04-01",
        hasComparisonProduct: false,
        scores: {
          ...fullScores({ 味: 4, 形: 4, 色: 3, 食感: 5, 香り: 3, とろみ: 2 }, "2025-04-01"),
          とろみ: {
            score: 2,
            reason: "冷やし固まりが弱い",
            timestamp: stepTimestamps("2025-04-01", CRITERIA.length, { start: "10:10" })[5],
          },
        },
      },
    ],
  },
  {
    id: "sr3",
    date: "2025-04-02",
    productName: "厚焼き玉子（本）　500g",
    manufactureDate: "2025-03-26",
    expiryDate: "2025-04-12",
    confirmer: "加藤由美",
    approvalStatus: "pending",
    scoreEntries: [
      {
        id: "se4",
        inspectorName: "西村あかり",
        confirmerName: "加藤由美",
        date: "2025-04-02",
        hasComparisonProduct: false,
        scores: fullScores({ 味: 5, 形: 5, 色: 5, 食感: 4, 香り: 5, とろみ: 5 }, "2025-04-02"),
      },
      {
        id: "se5",
        inspectorName: "松井由紀",
        confirmerName: "加藤由美",
        date: "2025-04-02",
        hasComparisonProduct: false,
        scores: fullScores({ 味: 4, 形: 5, 色: 5, 食感: 5, 香り: 4, とろみ: 5 }, "2025-04-02"),
      },
    ],
  },
  {
    id: "sr4",
    date: "2025-04-03",
    productName: "マンゴープリン　ストレート　1kg",
    manufactureDate: "2025-03-27",
    expiryDate: "2025-07-27",
    confirmer: "山本真理",
    approvalStatus: "approved",
    scoreEntries: [
      {
        id: "se6",
        inspectorName: "橋本大輔",
        confirmerName: "山本真理",
        date: "2025-04-03",
        hasComparisonProduct: false,
        scores: fullScores({ 味: 5, 形: 5, 色: 5, 食感: 5, 香り: 5, とろみ: 5 }, "2025-04-03"),
      },
    ],
  },
];
