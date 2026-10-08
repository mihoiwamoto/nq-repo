/**
 * データ検索 › 検体管理 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（A4 横。2026-10-08 に 4 帳票の形へ揃えた）。ここでは記録を表の行に読み替えるだけ。
 * 列は画面の表と同じ並び（操作は外す）に 備考・詳細 を足す。ロットNo. が無い製品は「ー」、賞味期限・製造日は YYYY/MM/DD。
 * 詳細は破棄した検体の「破棄日：… / 破棄理由：…」。
 */
import { downloadTableCsv, downloadTablePdf, type ExportColumn } from "../../utils/ledgerDataExport";
import type { SampleRecord } from "./types";

const fullDate = (d: string | undefined) => (d ? d.replaceAll("-", "/") : "ー");

function detailLines(r: SampleRecord): string[] {
  if (r.status !== "破棄済み") return [];
  const lines = [`破棄日：${fullDate(r.discardedDate)}`];
  if (r.discardReason) {
    const note = r.discardReason === "その他" && r.discardReasonNote ? `（${r.discardReasonNote}）` : "";
    lines.push(`破棄理由：${r.discardReason}${note}`);
  }
  return lines;
}

/** 日付 160・製品名 600・ロットNo./賞味期限/製造日/保管場所 250・検体種別/検体数量/単位/状態 200・備考/詳細 残りを半分ずつ */
const COLUMNS: ExportColumn<SampleRecord>[] = [
  { header: "実施日", width: 160, kind: "date", value: (r) => r.date },
  { header: "製品名", width: 600, kind: "name", value: (r) => r.productName },
  { header: "ロットNo.", width: 250, kind: "center", value: (r) => r.lotNumber || "ー" },
  { header: "賞味期限", width: 250, kind: "center", value: (r) => fullDate(r.expirationDate) },
  { header: "製造日", width: 250, kind: "center", value: (r) => fullDate(r.manufactureDate) },
  { header: "検体種別", width: 200, kind: "center", value: (r) => r.sampleType },
  { header: "検体数量", width: 200, kind: "center", value: (r) => r.sampleQuantity },
  { header: "単位", width: 200, kind: "center", value: (r) => r.unit },
  { header: "保管場所", width: 250, kind: "center", value: (r) => r.storageLocation },
  { header: "状態", width: 200, kind: "center", value: (r) => r.status },
  { header: "備考", kind: "note", value: (r) => r.remarks },
  { header: "詳細", kind: "note", value: detailLines },
];

function fileName(factoryName: string, year: number, month: number) {
  // 本番（SpecimenDocumentService）は「<工場名>_<YYYYMM>_検体」
  return `${factoryName}_${year}${String(month + 1).padStart(2, "0")}_検体`;
}

export function downloadSampleCsv(records: SampleRecord[], factoryName: string, year: number, month: number) {
  downloadTableCsv(COLUMNS, records, fileName(factoryName, year, month));
}

export function downloadSamplePdf(records: SampleRecord[], factoryName: string, year: number, month: number) {
  return downloadTablePdf(COLUMNS, records, {
    title: `検体データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
