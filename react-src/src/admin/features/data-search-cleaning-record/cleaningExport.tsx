/**
 * データ検索 › 清掃記録 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（確定デザイン Figma 7139:164288。2026-10-08）。
 * 清掃済みは ✓、見送り（清掃していない）は −。詳細の欄は空。
 */
import { downloadLedgerCsv, downloadLedgerPdf, type LedgerExportRow } from "../../utils/ledgerDataExport";
import type { CleaningSearchRecord } from "./types";

function toExportRows(records: CleaningSearchRecord[]): LedgerExportRow[] {
  return records.map((r) => ({
    date: r.date,
    lineLabel: r.lineLabel,
    result: r.cleaned ? "ok" : "skip",
    implementer: r.implementer,
    confirmer: r.confirmer,
    // 見送った記録は備考の頭に「点検見送り」（確定デザイン 7139:164289 の 04/01【毎週】殺菌ライン）
    remarks: r.cleaned ? r.remarks : `点検見送り ${r.remarks}`.trim(),
    detail: [],
  }));
}

function fileName(factoryName: string, year: number, month: number) {
  return `清掃記録データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadCleaningCsv(records: CleaningSearchRecord[], factoryName: string, year: number, month: number) {
  downloadLedgerCsv(toExportRows(records), fileName(factoryName, year, month));
}

export function downloadCleaningPdf(records: CleaningSearchRecord[], factoryName: string, year: number, month: number) {
  return downloadLedgerPdf(toExportRows(records), {
    title: `清掃記録データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
    // 確定デザイン（7139:164289）：1 ページ目だけ見出しが上から 96px（2 ページ目以降は 44px。2026-10-08 ユーザー指定）
    firstPageTop: 96,
  });
}
