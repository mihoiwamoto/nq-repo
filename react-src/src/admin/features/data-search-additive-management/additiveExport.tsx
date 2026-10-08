/**
 * データ検索 › 添加物管理 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（確定デザイン Figma 7139:164378。2026-10-08）。
 * 列は 日付・添加物名・区分・数量・現在庫数・保管場所・実施者・確認者・備考・詳細（詳細は空）。
 */
import { downloadTableCsv, downloadTablePdf, stockColumns, type StockExportRow } from "../../utils/ledgerDataExport";
import type { AdditiveRecord } from "./types";

const COLUMNS = stockColumns("添加物名", "現在庫数");

function toExportRows(records: AdditiveRecord[]): StockExportRow[] {
  return records.map((r) => ({
    date: r.date,
    name: r.additiveName,
    type: r.type,
    quantity: r.quantity,
    currentStock: r.currentStock,
    storageLocation: r.storageLocation,
    implementer: r.implementer,
    confirmer: r.confirmer,
    remarks: r.remarks,
  }));
}

function fileName(factoryName: string, year: number, month: number) {
  return `添加物管理データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadAdditiveCsv(records: AdditiveRecord[], factoryName: string, year: number, month: number) {
  downloadTableCsv(COLUMNS, toExportRows(records), fileName(factoryName, year, month));
}

export function downloadAdditivePdf(records: AdditiveRecord[], factoryName: string, year: number, month: number) {
  return downloadTablePdf(COLUMNS, toExportRows(records), {
    title: `添加物管理データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
