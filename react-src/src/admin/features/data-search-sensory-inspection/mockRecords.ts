import { stepTimestamps } from "../../utils/recordTimestamps";
import { CRITERIA } from "./types";
import type { CriterionScore, Criterion, ScoreEntry, SensoryRecord } from "./types";
import { aprilDays, at, demoComments, statusAt, ymd } from "../../data/demoRecordGen";

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

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の sr1〜sr4 は画面設計の hash と確定デザインが使うので変えない）。
 * 4 月の稼働日に 1〜2 製品。3 月末・5 月頭にも少し。検査する人は 1〜3 人、比較品ありも混ぜる。
 * 2 点以下の項目（理由つき）＝検査結果 不合格 を 4 件に 1 件ほど。
 * ─────────────────────────────────────────────────────────────── */
const SENSORY_PRODUCTS = [
  { name: "マンゴープリン　ストレート　1kg", life: 120 },
  { name: "厚焼き玉子（本）　500g", life: 17 },
  { name: "だし巻き玉子　厚焼き　300g", life: 14 },
  { name: "カスタードプリン　80g", life: 30 },
  { name: "業務用 なめらかカスタードプリン（バニラビーンズ入り・低糖タイプ）　1kg×6袋", life: 90 },
];

const LOW_REASONS: Partial<Record<Criterion, string[]>> = {
  味: ["甘みが弱い", "塩味が強く、後味に苦みが残る"],
  形: ["角が欠けている", "中央がへこんでいる"],
  色: ["焼き色が濃い", "表面にムラがある"],
  食感: ["固く、なめらかさが無い", "水っぽい"],
  香り: ["卵の香りが弱い", "焦げた香りがする"],
  とろみ: ["冷やし固まりが弱い", "とろみが強すぎる"],
};

const INSPECTORS = ["西村あかり", "橋本大輔", "松井由紀", "高橋美咲", "松本奈々"];

function scoresFor(n: number, date: string, low: boolean): Record<Criterion, CriterionScore> {
  const base = Object.fromEntries(CRITERIA.map((c, i) => [c, 5 - ((n + i * 2) % 5 === 0 ? 1 : 0) - ((n + i) % 7 === 0 ? 1 : 0)])) as Record<string, number>;
  const scores = fullScores(base, date);
  if (!low) return scores;
  // 1〜2 項目を 2 点以下にし、理由を書く
  const targets = [at(CRITERIA, n), ...(n % 2 ? [at(CRITERIA, n + 3)] : [])];
  for (const c of targets) {
    const reasons = LOW_REASONS[c] ?? ["基準に満たない"];
    scores[c] = { ...scores[c], score: n % 3 === 0 ? 1 : 2, reason: at(reasons, n) };
  }
  return scores;
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sensoryExtra(): SensoryRecord[] {
  const out: SensoryRecord[] = [];
  const days: [number, number][] = [[3, 26], [3, 28], [3, 31], ...aprilDays(4, 30, [12, 19, 26]).map((d) => [4, d] as [number, number]), [5, 1], [5, 2]];
  let n = 0;
  let se = 0;
  days.forEach(([m, d], di) => {
    // 月・木は 2 製品
    const count = di % 4 === 0 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const date = ymd(m, d);
      const product = at(SENSORY_PRODUCTS, di + k * 2);
      const manufactureDate = addDays(date, -((n % 5) + 3));
      const confirmer = n % 3 === 1 ? "加藤由美" : "山本真理";
      const low = n % 4 === 2;
      const people = 1 + (n % 3);
      const entries: ScoreEntry[] = Array.from({ length: people }, (_, j) => {
        const comparison = (n + j) % 5 === 1;
        return {
          id: `se-x${++se}`,
          inspectorName: at(INSPECTORS, n + j),
          confirmerName: confirmer,
          date,
          hasComparisonProduct: comparison,
          ...(comparison ? { comparisonManufactureDate: addDays(manufactureDate, -2) } : {}),
          scores: scoresFor(n + j * 3, date, low && j === 0),
        };
      });
      const id = `sr-x${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}-${k + 1}`;
      const rec: SensoryRecord = {
        id,
        date,
        productName: product.name,
        manufactureDate,
        expiryDate: addDays(manufactureDate, product.life),
        confirmer,
        approvalStatus: statusAt(n),
        scoreEntries: entries,
      };
      if (low) {
        rec.comments = demoComments(id, date, [
          [confirmer, "2点以下の項目があるため、同じロットの製品を追加で確認してください。"],
          ["佐藤健一", "同ロットを 3 点追加で確認し、問題が無いことを確認しました。"],
        ]);
      }
      out.push(rec);
      n++;
    }
  });
  return out;
}

sensoryRecords.push(...sensoryExtra());
