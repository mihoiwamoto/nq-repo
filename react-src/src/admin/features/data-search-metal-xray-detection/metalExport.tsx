/**
 * データ検索 › 金属/X線探知機記録 › データ一覧 の PDF・CSV 出力（帳票名は「金属探知機記録」）。
 * 形は共通の utils/ledgerDataExport.tsx（A4 横。2026-10-08 に 4 帳票の形へ揃えた）。ここでは記録を表の行に読み替えるだけ。
 * 列は画面の表と同じ並び（操作・ステータスは外す）に 備考・詳細 を足す。
 * 備考は点検ごとの備考を「点検内容：備考」で 1 行ずつ。詳細は NG の点検の「区分・点検内容（時刻）：NG / 製品 / 原因 / 対応」。
 */
import { downloadTableCsv, downloadTablePdf, type ExportColumn } from "../../utils/ledgerDataExport";
import type { InspectionRecord, MachineSearchRecord } from "./types";

function label(i: InspectionRecord) {
  return `${i.category !== "ー" ? `${i.category}・` : ""}${i.content}（${i.time}）`;
}

function remarkLines(r: MachineSearchRecord): string[] {
  return r.records.filter((i) => i.remarks).map((i) => `${i.content}：${i.remarks}`);
}

function detailLines(r: MachineSearchRecord): string[] {
  const lines: string[] = [];
  for (const i of r.records) {
    if (i.result !== "NG") continue;
    lines.push(`${label(i)}：NG`);
    if (i.passedProduct && i.passedProduct !== "ー") lines.push(`製品：${i.passedProduct}`);
    if (i.cause) lines.push(`原因：${i.cause}`);
    if (i.response) lines.push(`対応：${i.response}`);
  }
  return lines;
}

/** 日付 160・点検構成名 1000・結果/確認者 200・備考/詳細 残りを半分ずつ */
const COLUMNS: ExportColumn<MachineSearchRecord>[] = [
  { header: "実施日", width: 160, kind: "date", value: (r) => r.date },
  { header: "点検構成名", width: 1000, kind: "name", value: (r) => r.machineName },
  { header: "結果", width: 200, kind: "result", value: () => "", result: (r) => (r.result === "NG" ? "ng" : "ok") },
  { header: "確認者", width: 200, kind: "center", value: (r) => r.confirmer },
  { header: "備考", kind: "note", value: remarkLines },
  { header: "詳細", kind: "note", value: detailLines },
];

function fileName(factoryName: string, year: number, month: number) {
  return `金属探知機記録データ一覧_${factoryName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadMetalCsv(records: MachineSearchRecord[], factoryName: string, year: number, month: number) {
  downloadTableCsv(COLUMNS, records, fileName(factoryName, year, month));
}

export function downloadMetalPdf(records: MachineSearchRecord[], factoryName: string, year: number, month: number) {
  return downloadTablePdf(COLUMNS, records, {
    title: `金属探知機記録データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, year, month),
  });
}
