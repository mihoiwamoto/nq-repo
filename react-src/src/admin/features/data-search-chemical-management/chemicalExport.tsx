/**
 * データ検索 › 薬品管理 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（確定デザイン Figma 7139:164675。2026-10-08）。
 * 列は 日付・薬品名・区分・数量・在庫・保管場所・実施者・確認者・備考・詳細（詳細は空）。
 */
import { downloadTableCsv, downloadTablePdf, stockColumns, type StockExportRow } from "../../utils/ledgerDataExport";
import type { ChemicalRecord } from "./types";

const COLUMNS = stockColumns("薬品名", "在庫");

function toExportRows(records: ChemicalRecord[]): StockExportRow[] {
  return records.map((r) => ({
    date: r.date,
    name: r.chemicalName,
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
  return `薬品管理データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadChemicalCsv(records: ChemicalRecord[], factoryName: string, year: number, month: number) {
  downloadTableCsv(COLUMNS, toExportRows(records), fileName(factoryName, year, month));
}

export function downloadChemicalPdf(records: ChemicalRecord[], factoryName: string, year: number, month: number) {
  return downloadTablePdf(COLUMNS, toExportRows(records), {
    title: `薬品管理データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
