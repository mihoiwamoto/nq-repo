/**
 * データ検索 › 機械器具点検 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（Figma 7139:259444）。ここでは記録を表の行に読み替えるだけ。
 * 詳細は異常ありの項目の「点検不備 / 原因：… / 対応：…」。
 */
import { downloadLedgerCsv, downloadLedgerPdf, type LedgerExportRow } from "../../utils/ledgerDataExport";
import type { InspectionRecord } from "./types";

/** 選択肢の「その他 / 」は外して、書いた文だけを出す */
function stripChoice(text: string) {
  return text.replace(/^その他\s*\/\s*/, "");
}

function detailLines(record: InspectionRecord): string[] {
  if (record.resultIcon !== "ng") return [];
  const lines: string[] = [];
  for (const session of record.sessions) {
    for (const point of session.points) {
      for (const item of point.items) {
        if (item.status !== "ng") continue;
        if (item.cause) lines.push(`原因：${item.cause}`);
        if (item.action) lines.push(`対応：${stripChoice(item.action)}`);
      }
    }
  }
  return ["点検不備", ...lines];
}

function toExportRows(records: InspectionRecord[]): LedgerExportRow[] {
  return records.map((r) => ({
    date: r.date,
    lineLabel: r.lineLabel,
    result: r.resultIcon,
    implementer: r.implementer,
    confirmer: r.confirmer,
    remarks: r.remarks,
    detail: detailLines(r),
  }));
}

function fileName(factoryName: string, year: number, month: number) {
  return `機械器具点検データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadEquipmentCsv(records: InspectionRecord[], factoryName: string, year: number, month: number) {
  downloadLedgerCsv(toExportRows(records), fileName(factoryName, year, month));
}

export function downloadEquipmentPdf(records: InspectionRecord[], factoryName: string, year: number, month: number) {
  return downloadLedgerPdf(toExportRows(records), {
    title: `機械器具点検データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
