/**
 * データ検索 › 官能検査記録 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（A4 横。2026-10-08 に 4 帳票の形へ揃えた）。ここでは記録を表の行に読み替えるだけ。
 * 列は画面の表と同じ並び（操作・ステータスは外す）に 備考・詳細 を足す。官能検査記録には備考が無いので空。
 * 味〜とろみは画面と同じく点数の平均（小数 1 桁）。詳細は 2 点以下を付けた項目の「〇〇 2点（実施者）：理由」。
 */
import { downloadTableCsv, downloadTablePdf, type ExportColumn } from "../../utils/ledgerDataExport";
import { CRITERIA, isAbnormalScore, type Criterion, type SensoryRecord } from "./types";

function averageScore(r: SensoryRecord, c: Criterion) {
  const scores = r.scoreEntries.map((e) => e.scores[c].score);
  return scores.length === 0 ? "" : (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);
}

function isAbnormal(r: SensoryRecord) {
  return r.scoreEntries.some((e) => CRITERIA.some((c) => isAbnormalScore(e.scores[c].score)));
}

function detailLines(r: SensoryRecord): string[] {
  const lines: string[] = [];
  for (const e of r.scoreEntries) {
    for (const c of CRITERIA) {
      const s = e.scores[c];
      if (!isAbnormalScore(s.score)) continue;
      lines.push(`${c} ${s.score}点（${e.inspectorName}）${s.reason ? `：${s.reason}` : ""}`);
    }
  }
  return lines;
}

/** 日付 160・検査製品名 600・味〜とろみ/検査結果/確認者 200・備考/詳細 残りを半分ずつ */
const COLUMNS: ExportColumn<SensoryRecord>[] = [
  { header: "日付", width: 160, kind: "date", value: (r) => r.date },
  { header: "検査製品名", width: 600, kind: "name", value: (r) => r.productName },
  ...CRITERIA.map<ExportColumn<SensoryRecord>>((c) => ({ header: c, width: 200, kind: "center", value: (r) => averageScore(r, c) })),
  { header: "検査結果", width: 200, kind: "result", value: () => "", result: (r) => (isAbnormal(r) ? "ng" : "ok") },
  { header: "確認者", width: 200, kind: "center", value: (r) => r.confirmer },
  { header: "備考", kind: "note", value: () => "" },
  { header: "詳細", kind: "note", value: detailLines },
];

/** 本番の PDF は列が 確認者 まで（備考・詳細は無い）。検査製品名で残りの幅を埋める */
const PDF_COLUMNS: ExportColumn<SensoryRecord>[] = COLUMNS.filter((c) => c.kind !== "note").map((c) =>
  c.kind === "name" ? { ...c, width: undefined } : c,
);

function fileName(factoryName: string, year: number, month: number) {
  return `官能検査記録データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadSensoryCsv(records: SensoryRecord[], factoryName: string, year: number, month: number) {
  downloadTableCsv(COLUMNS, records, fileName(factoryName, year, month));
}

export function downloadSensoryPdf(records: SensoryRecord[], factoryName: string, year: number, month: number) {
  return downloadTablePdf(PDF_COLUMNS, records, {
    title: `官能検査記録データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
