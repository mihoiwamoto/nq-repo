/**
 * データ検索 › 使用水の点検 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（A4 横。2026-10-08 に 4 帳票の形へ揃えた）。ここでは記録を表の行に読み替えるだけ。
 * 本番（admin/document/water/pdf.blade.php・WaterDocumentService）に合わせる：
 * PDF は画面の表と同じ並び（操作・ステータスは外す）に 詳細 を足す（備考は無い）。補充・交換は値の下。見出しは工場名まで。
 * CSV は本番の列（点検エリア・点検日時 …・塩素補充・UV殺菌灯交換 …）。詳細は「原因(味): … 対応(味): …」。
 */
import { downloadTableCsv, downloadTablePdf, type ExportColumn } from "../../utils/ledgerDataExport";
import type { WaterCheckResult, WaterSearchRecord } from "./types";

const CHECKS: { label: string; get: (r: WaterSearchRecord) => WaterCheckResult }[] = [
  { label: "味", get: (r) => r.taste },
  { label: "臭い", get: (r) => r.smell },
  { label: "色", get: (r) => r.color },
  { label: "濁り", get: (r) => r.turbidity },
  { label: "異物", get: (r) => r.foreignMatter },
];

// 本番（admin/document/water/pdf.blade.php・WaterDocumentService）は異常のとき「異常」
const uvLightLabel = (v: "on" | "off") => (v === "on" ? "点灯" : "異常");
const alertLightLabel = (v: "on" | "off") => (v === "on" ? "異常" : "消灯");

/** 詳細は 原因があるものだけ「原因(味): …」「対応(味): …」（本番の書き方） */
function detailLines(r: WaterSearchRecord): string[] {
  const lines: string[] = [];
  for (const c of CHECKS) {
    const v = c.get(r);
    if (v.status !== "abnormal" || !v.cause) continue;
    lines.push(`原因(${c.label}): ${v.cause}`);
    if (v.action) lines.push(`対応(${c.label}): ${v.action}`);
  }
  return lines;
}

/** PDF。本番の列は 確認者 の次が 詳細（備考は無い）。補充・交換は値の下に出す */
const PDF_COLUMNS: ExportColumn<WaterSearchRecord>[] = [
  { header: "日付", width: 160, kind: "date", value: (r) => r.date },
  { header: "点検時間", width: 180, kind: "center", value: (r) => r.time },
  { header: "点検場所", width: 250, kind: "center", value: (r) => r.location },
  ...CHECKS.map<ExportColumn<WaterSearchRecord>>((c) => ({
    header: c.label,
    width: 110,
    kind: "result",
    value: () => "",
    result: (r) => (c.get(r).status === "abnormal" ? "ng" : "ok"),
  })),
  { header: "ph値", width: 110, kind: "center", value: (r) => String(r.ph) },
  {
    header: "残留塩素濃度（mg/ℓ）",
    width: 380,
    kind: "note",
    value: (r) => (r.chlorineReplenished ? [String(r.chlorine), "補充"] : String(r.chlorine)),
  },
  {
    header: "UV殺菌灯稼働時間",
    width: 320,
    kind: "note",
    value: (r) => (r.uvLampReplaced ? [String(r.uvOperatingHours), "交換"] : String(r.uvOperatingHours)),
  },
  { header: "UV表示灯", width: 200, kind: "center", value: (r) => uvLightLabel(r.uvIndicatorLight) },
  { header: "異常検出灯", width: 200, kind: "center", value: (r) => alertLightLabel(r.abnormalDetectionLight) },
  { header: "実施者", width: 200, kind: "center", value: (r) => r.implementer },
  { header: "確認者", width: 200, kind: "center", value: (r) => r.confirmer },
  { header: "詳細", kind: "note", value: detailLines },
];

/** CSV。本番（WaterDocumentService::getCsvHeader）の列：点検エリア・点検日時・各項目・塩素補充・UV殺菌灯交換・実施者・確認者・詳細 */
const okNg = (v: WaterCheckResult) => (v.status === "abnormal" ? "異常" : "正常");
function csvDateTime(r: WaterSearchRecord) {
  const [y, m, d] = r.date.split("-");
  return `${y.slice(2)}年${m}月${d}日 ${r.time}`;
}
const CSV_COLUMNS: ExportColumn<WaterSearchRecord>[] = [
  { header: "点検エリア", kind: "center", value: (r) => r.location },
  { header: "点検日時", kind: "center", value: csvDateTime },
  ...CHECKS.map<ExportColumn<WaterSearchRecord>>((c) => ({ header: c.label, kind: "center", value: (r) => okNg(c.get(r)) })),
  { header: "ph値", kind: "center", value: (r) => String(r.ph) },
  { header: "残留塩素濃度 \n（mg/ℓ）", kind: "center", value: (r) => String(r.chlorine) },
  { header: "塩素補充", kind: "center", value: (r) => (r.chlorineReplenished ? "補充した" : "補充なし") },
  { header: "UV殺菌灯 \n 稼働時間", kind: "center", value: (r) => String(r.uvOperatingHours) },
  { header: "UV殺菌灯交換", kind: "center", value: (r) => (r.uvLampReplaced ? "交換した" : "交換なし") },
  { header: "UV表示灯", kind: "center", value: (r) => uvLightLabel(r.uvIndicatorLight) },
  { header: "異常検出灯", kind: "center", value: (r) => alertLightLabel(r.abnormalDetectionLight) },
  { header: "実施者", kind: "center", value: (r) => r.implementer },
  { header: "確認者", kind: "center", value: (r) => r.confirmer },
  { header: "詳細", kind: "note", value: (r) => detailLines(r).join("\n").replace(/\n対応/g, " 対応") },
];

function fileName(factoryName: string, location: string, year: number, month: number) {
  return ["使用水の点検データ一覧", factoryName, location, `${year}${String(month + 1).padStart(2, "0")}`]
    .filter(Boolean)
    .join("_");
}

export function downloadWaterCsv(records: WaterSearchRecord[], factoryName: string, location: string, year: number, month: number) {
  downloadTableCsv(CSV_COLUMNS, records, fileName(factoryName, location, year, month));
}

export function downloadWaterPdf(records: WaterSearchRecord[], factoryName: string, location: string, year: number, month: number) {
  return downloadTablePdf(PDF_COLUMNS, records, {
    title: `使用水の点検データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, location, year, month),
  });
}
