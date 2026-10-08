/**
 * データ検索 › ガラスプラスチック管理 › データ一覧 の PDF・CSV 出力。
 * 形は共通の utils/ledgerDataExport.tsx（A4 横。2026-10-08 に 4 帳票の形へ揃えた）。ここでは記録を表の行に読み替えるだけ。
 * 本番（GpDocumentService・admin/document/gp/pdf.blade.php）に合わせる：
 * - PDF は画面の表と同じ並び（操作・ステータスは外す）に 詳細 を足す（備考は無い）。箇所数は「〇件」。見出しは工場名まで
 * - 詳細は異常の箇所ごとに 部屋／箇所／内容:…／原因:…／対応:…（1 行ずつ）
 * - CSV は点検物ごとの行（点検フロア名・点検日時・部屋名・点検物名・正常/異常・点検者・確認者・異常詳細・修理ステータス）
 */
import { downloadTableCsv, downloadTablePdf, type ExportColumn } from "../../utils/ledgerDataExport";
import {
  countByStatus,
  type GlassPlasticItemRecord,
  type GlassPlasticRecord,
  type GlassPlasticRoomRecord,
} from "./types";

function itemDetail(room: GlassPlasticRoomRecord, item: GlassPlasticItemRecord): string[] {
  return [
    room.name,
    item.name,
    `内容:${item.content ?? ""}`,
    `原因:${item.cause ?? ""}`,
    `対応:${item.actionType ?? ""}${item.actionDetail ?? ""}`,
  ];
}

function detailLines(r: GlassPlasticRecord): string[] {
  const lines: string[] = [];
  for (const room of r.rooms) {
    for (const item of room.items) {
      if (item.status === "normal") continue;
      lines.push(...itemDetail(room, item));
    }
  }
  return lines;
}

/** 日付 160・点検場所 600・総点検箇所数 250・正常/異常あり/実施者/確認者 200・詳細 残り */
const PDF_COLUMNS: ExportColumn<GlassPlasticRecord>[] = [
  { header: "日付", width: 160, kind: "date", value: (r) => r.date },
  { header: "点検場所", width: 600, kind: "name", value: (r) => r.floorName },
  { header: "総点検箇所数", width: 250, kind: "center", value: (r) => `${countByStatus(r).total}件` },
  { header: "正常", width: 200, kind: "center", value: (r) => `${countByStatus(r).normal}件` },
  { header: "異常あり", width: 200, kind: "center", value: (r) => `${countByStatus(r).issue}件` },
  { header: "実施者", width: 200, kind: "center", value: (r) => r.implementer },
  { header: "確認者", width: 200, kind: "center", value: (r) => r.confirmer },
  { header: "詳細", kind: "note", value: detailLines },
];

type CsvRow = {
  floorName: string;
  checkAt: string;
  room: GlassPlasticRoomRecord;
  item: GlassPlasticItemRecord;
  implementer: string;
  confirmer: string;
};

const REPAIR_LABEL: Record<GlassPlasticItemRecord["status"], string> = {
  normal: "修理なし",
  issue: "要対応",
  action_needed: "要対応",
  repairing: "修理中",
};

const CSV_COLUMNS: ExportColumn<CsvRow>[] = [
  { header: "点検フロア名", kind: "center", value: (r) => r.floorName },
  { header: "点検日時", kind: "center", value: (r) => r.checkAt },
  { header: "部屋名", kind: "center", value: (r) => r.room.name },
  { header: "点検物名", kind: "center", value: (r) => r.item.name },
  { header: "正常/異常", kind: "center", value: (r) => (r.item.status === "normal" ? "正常" : "異常") },
  { header: "点検者", kind: "center", value: (r) => r.implementer },
  { header: "確認者", kind: "center", value: (r) => r.confirmer },
  { header: "異常詳細", kind: "note", value: (r) => itemDetail(r.room, r.item) },
  { header: "修理ステータス", kind: "center", value: (r) => REPAIR_LABEL[r.item.status] },
];

function csvRows(records: GlassPlasticRecord[]): CsvRow[] {
  return records.flatMap((r) =>
    r.rooms.flatMap((room) =>
      room.items.map((item) => ({
        floorName: r.floorName,
        // データ検索の記録には入力時刻が無いので、詳細画面と同じ 10:15 を補う
        checkAt: `${r.date} 10:15:00`,
        room,
        item,
        implementer: r.implementer,
        confirmer: r.confirmer,
      }))
    )
  );
}

function fileName(factoryName: string, floorName: string, year: number, month: number) {
  return `ガラスプラスチック管理データ一覧_${factoryName}_${floorName}_${year}${String(month + 1).padStart(2, "0")}`;
}

export function downloadGlassPlasticCsv(records: GlassPlasticRecord[], factoryName: string, floorName: string, year: number, month: number) {
  downloadTableCsv(CSV_COLUMNS, csvRows(records), fileName(factoryName, floorName, year, month));
}

export function downloadGlassPlasticPdf(records: GlassPlasticRecord[], factoryName: string, floorName: string, year: number, month: number) {
  return downloadTablePdf(PDF_COLUMNS, records, {
    title: `ガラスプラスチック管理データ一覧：${factoryName}`,
    year,
    month,
    fileName: fileName(factoryName, floorName, year, month),
  });
}
