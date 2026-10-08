/**
 * データ検索 › 秤点検記録 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（A4 横。2026-10-08 に 4 帳票の形へ揃えた）。ここでは記録を表の行に読み替えるだけ。
 * 列は画面の表と同じ並び（操作・ステータスは外し、備考は 4 帳票と同じく後ろへ）に 詳細 を足す。
 * 動作確認・水平点検・汚れは画面と同じく、見送り・動作確認が異常のときの水平点検/汚れ・未点検は「ー」。
 * 詳細は動作確認の異常（原因・対応・修理状況）と、秤の表示値のずれ（基準・原因）。
 */
import { downloadTableCsv, downloadTablePdf, type ExportColumn, type LedgerExportResult } from "../../utils/ledgerDataExport";
import { REPAIR_STATUS_LABELS, type ScaleRecord } from "./types";

function operationResult(r: ScaleRecord): LedgerExportResult {
  if (r.skipped) return "skip";
  return r.operationCheck === "ok" ? "ok" : "ng";
}

function subResult(r: ScaleRecord, field: "levelCheck" | "dirtCheck"): LedgerExportResult {
  if (r.skipped || r.operationCheck === "ng") return "skip";
  return r[field] === "ok" ? "ok" : "skip";
}

function displayValue(r: ScaleRecord) {
  if (r.skipped || r.operationCheck === "ng" || r.displayValue === null) return "ー";
  return String(r.displayValue);
}

function detailLines(r: ScaleRecord): string[] {
  if (r.skipped) return [];
  const lines: string[] = [];
  if (r.operationCheck === "ng") {
    lines.push("動作確認：異常あり");
    if (r.operationCause) lines.push(`原因：${r.operationCause}`);
    if (r.operationAction) lines.push(`対応：${r.operationAction}`);
    if (r.repairStatus) lines.push(`修理状況：${REPAIR_STATUS_LABELS[r.repairStatus]}`);
  }
  if (r.weightCause) {
    lines.push(`表示値のずれ（基準 ${r.referenceWeight}g）`);
    lines.push(`原因：${r.weightCause}`);
  }
  return lines;
}

/** 日付 160・秤No. 600・シリアルナンバー/持ち場 300・動作確認/水平点検/汚れ 200・表示値 250・実施者/確認者 200・備考/詳細 残りを半分ずつ */
const COLUMNS: ExportColumn<ScaleRecord>[] = [
  { header: "日付", width: 160, kind: "date", value: (r) => r.date },
  { header: "秤No.(ラベル名)", width: 600, kind: "name", value: (r) => r.scaleLabel },
  { header: "シリアルナンバー", width: 300, kind: "center", value: (r) => r.serialNumber },
  { header: "持ち場", width: 300, kind: "center", value: (r) => r.post },
  { header: "動作確認", width: 200, kind: "result", value: () => "", result: operationResult },
  { header: "水平点検", width: 200, kind: "result", value: () => "", result: (r) => subResult(r, "levelCheck") },
  { header: "汚れ", width: 200, kind: "result", value: () => "", result: (r) => subResult(r, "dirtCheck") },
  { header: "秤の表示値（g）", width: 250, kind: "center", value: displayValue },
  { header: "実施者", width: 200, kind: "center", value: (r) => r.implementer },
  { header: "確認者", width: 200, kind: "center", value: (r) => r.confirmer },
  { header: "備考", kind: "note", value: (r) => r.remarks },
  { header: "詳細", kind: "note", value: detailLines },
];

function fileName(factoryName: string, year: number, month: number) {
  return `秤点検記録データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadScaleCsv(records: ScaleRecord[], factoryName: string, year: number, month: number) {
  downloadTableCsv(COLUMNS, records, fileName(factoryName, year, month));
}

export function downloadScalePdf(records: ScaleRecord[], factoryName: string, year: number, month: number) {
  return downloadTablePdf(COLUMNS, records, {
    title: `秤点検記録データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
