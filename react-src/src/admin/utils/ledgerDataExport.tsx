/**
 * データ検索 › データ一覧 の PDF・CSV 出力（帳票で共通）。確定デザイン（いずれも A4 横。2026-10-08）
 * - 機械器具点検 Figma 7139:259444・清掃記録 7139:164288 … 日付・持ち場名/ライン名・点検結果・実施者・確認者・備考・詳細
 * - 添加物管理 7139:164378・薬品管理 7139:164675 … 日付・〇〇名・区分・数量・現在庫数（在庫）・保管場所・実施者・確認者・備考・詳細
 * 共通の形：A4 横 1 ページ = 3508×2480px（300dpi）。上 44px・左右 44px の余白に、見出し → 表 → ページ番号。
 * 見出しの行は黒地に白、行の背景は日付が変わるたびに 白 / #d0d0d0、備考・詳細は残りの幅を半分ずつで折り返す。
 * CSV も同じ列・同じ並び。帳票ごとの列と、記録 → 値の読み替えは各帳票の側（equipmentExport.tsx など）。
 */
import type { CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { downloadPagesAsPdf } from "./pdf";

export type LedgerExportResult = "ok" | "ng" | "skip";

/**
 * 表の 1 列。
 * - date   … 日付（「04/01」・太字・中央。行の縞もこの値で切り替える）
 * - name   … 持ち場名/ライン名・添加物名など（左寄せ）
 * - center … 実施者・区分・数量など（中央）。bold で太字
 * - result … 点検結果（✓ / − / ×）
 * - note   … 備考・詳細（左寄せ・折り返し）。値を配列にすると 1 要素 1 行
 * width を書かない列は、残りの幅を等分する。
 */
export type ExportColumn<T> = {
  header: string;
  width?: number;
  kind: "date" | "name" | "center" | "result" | "note";
  bold?: boolean;
  /** note の文字（添加物管理・薬品管理はヒラギノ W3・行の高さ 1.6） */
  light?: boolean;
  value: (row: T) => string | string[];
  /** kind: "result" のとき */
  result?: (row: T) => LedgerExportResult;
};

// 見送り（点検・清掃していない）は「ー」（画面の表と同じ。2026-10-08 ユーザー指定）
const RESULT_TEXT: Record<LedgerExportResult, string> = { ok: "✓", skip: "ー", ng: "×" };

function dateLabel(date: string) {
  const [, m, d] = date.split("-");
  return `${m}/${d}`;
}

function textOf<T>(col: ExportColumn<T>, row: T): string {
  if (col.kind === "result" && col.result) return RESULT_TEXT[col.result(row)];
  const v = col.value(row);
  if (Array.isArray(v)) return v.join("\n");
  return col.kind === "date" ? dateLabel(v) : v;
}

/* ---------------- CSV ---------------- */

/** CSV を出す。fileName は拡張子なし */
export function downloadTableCsv<T>(columns: ExportColumn<T>[], rows: T[], fileName: string) {
  const body = rows.map((r) => columns.map((c) => textOf(c, r)));
  const csv = [columns.map((c) => c.header), ...body]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- PDF ---------------- */

const PAGE_W = 3508;
const PAGE_H = 2480;
const PAD = 44;
const INNER_W = PAGE_W - PAD * 2; // 3420
/** 表に使える高さ（Figma の Page1 の表 2252px） */
const TABLE_MAX_H = 2252;
const BORDER = "#808080";
const TEXT = "#333333";
const STRIPE = "#d0d0d0";
const FONT_BOLD = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif';
const FONT_REGULAR = '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif';
const FONT_LIGHT = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif';

/** width の無い列で残りを等分する */
function colWidths<T>(columns: ExportColumn<T>[]) {
  const fixed = columns.reduce((a, c) => a + (c.width ?? 0), 0);
  const free = columns.filter((c) => c.width === undefined).length;
  const rest = free > 0 ? (INNER_W - fixed) / free : 0;
  return columns.map((c) => c.width ?? rest);
}

const cellBase: CSSProperties = {
  border: `2px solid ${BORDER}`,
  height: 112,
  boxSizing: "border-box",
  fontSize: 30,
  lineHeight: 1.2,
  color: TEXT,
  verticalAlign: "middle",
  textAlign: "center",
  whiteSpace: "nowrap",
  fontFamily: FONT_REGULAR,
  fontWeight: 400,
};
const headCell: CSSProperties = {
  ...cellBase,
  background: "#333333",
  color: "#ffffff",
  fontFamily: FONT_BOLD,
  fontWeight: 600,
};
const textCell: CSSProperties = {
  ...cellBase,
  textAlign: "left",
  verticalAlign: "middle",
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.4,
  padding: 24,
};

/** html2canvas は埋め込みの <svg> を描かないので、画像（data URI）にして置く */
function svgIcon(body: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none">${body}</svg>`)}`;
}
const RESULT_ICON: Record<LedgerExportResult, string> = {
  ok: svgIcon(`<path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="${TEXT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  skip: svgIcon(`<path d="M5 12H19" stroke="${TEXT}" stroke-width="2" stroke-linecap="round"/>`),
  ng: svgIcon(`<path d="M6 6L18 18M18 6L6 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`),
};

function ResultIconImg({ result }: { result: LedgerExportResult }) {
  return <img src={RESULT_ICON[result]} width={36} height={36} alt={RESULT_TEXT[result]} style={{ display: "block", margin: "0 auto" }} />;
}

function PdfCell<T>({ col, row, first, last }: { col: ExportColumn<T>; row: T; first: boolean; last: boolean }) {
  const edge: CSSProperties = { ...(first ? { borderLeftWidth: 3 } : {}), ...(last ? { borderRightWidth: 3 } : {}) };
  const bold: CSSProperties = { fontFamily: FONT_BOLD, fontWeight: 600 };
  switch (col.kind) {
    case "date":
      return <td style={{ ...cellBase, ...bold, ...edge }}>{dateLabel(col.value(row) as string)}</td>;
    case "name":
      return (
        <td style={{ ...cellBase, ...(col.bold ? bold : {}), textAlign: "left", padding: "0 4px", whiteSpace: "normal", wordBreak: "break-word", ...edge }}>
          {col.value(row)}
        </td>
      );
    case "center":
      return <td style={{ ...cellBase, ...(col.bold ? bold : {}), ...edge }}>{col.value(row)}</td>;
    case "result": {
      const r = col.result ? col.result(row) : "ok";
      return (
        <td style={{ ...cellBase, background: r === "ng" ? "#333333" : undefined, ...edge }}>
          <ResultIconImg result={r} />
        </td>
      );
    }
    case "note": {
      const v = col.value(row);
      const light: CSSProperties = col.light ? { fontFamily: FONT_LIGHT, fontWeight: 300, lineHeight: 1.6 } : {};
      return (
        <td style={{ ...textCell, ...light, ...edge }}>
          {Array.isArray(v) ? v.map((line, j) => <div key={j}>{line}</div>) : v}
        </td>
      );
    }
  }
}

function PdfTable<T>({ columns, rows, stripes }: { columns: ExportColumn<T>[]; rows: T[]; stripes: boolean[] }) {
  const widths = colWidths(columns);
  return (
    <table style={{ width: INNER_W, borderCollapse: "collapse", tableLayout: "fixed" }}>
      <colgroup>
        {widths.map((w, i) => (
          <col key={i} style={{ width: w }} />
        ))}
      </colgroup>
      <thead>
        <tr data-pdf-head>
          {columns.map((c) => (
            <th key={c.header} style={headCell}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr data-pdf-row>
            <td colSpan={columns.length} style={textCell}>
              データがありません。
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <tr key={i} data-pdf-row style={{ background: stripes[i] ? STRIPE : "#ffffff" }}>
              {columns.map((c, j) => (
                <PdfCell key={j} col={c} row={r} first={j === 0} last={j === columns.length - 1} />
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function PdfPage<T>({
  title,
  monthLabel,
  columns,
  rows,
  stripes,
  pageNo,
  pageCount,
  top = PAD,
}: {
  top?: number;
  title: string;
  monthLabel: string;
  columns: ExportColumn<T>[];
  rows: T[];
  stripes: boolean[];
  pageNo: number;
  pageCount: number;
}) {
  const heading: CSSProperties = { fontFamily: FONT_BOLD, fontWeight: 600, fontSize: 40, lineHeight: 1, color: TEXT, whiteSpace: "nowrap" };
  return (
    <div data-pdf-page style={{ width: PAGE_W, height: PAGE_H, background: "#ffffff", position: "relative", boxSizing: "border-box", padding: `${top}px ${PAD}px 0` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, width: INNER_W }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 40, ...heading }}>
          <span>{title}</span>
          <span>{monthLabel}</span>
        </div>
        <PdfTable columns={columns} rows={rows} stripes={stripes} />
      </div>
      {/* 表が短いページでも、ページ番号は下の端（下の余白 24px）に置く */}
      <div style={{ position: "absolute", right: PAD, bottom: 24, display: "flex", alignItems: "center", height: 40, ...heading }}>
        {pageNo}/{pageCount}
      </div>
    </div>
  );
}

/** 日付が変わるたびに 白 / グレー を切り替える（ページをまたいでも続ける） */
function dateStripes<T>(columns: ExportColumn<T>[], rows: T[]) {
  const dateCol = columns.find((c) => c.kind === "date");
  let group = -1;
  let prev: string | undefined;
  return rows.map((r) => {
    const date = dateCol ? String(dateCol.value(r)) : "";
    if (date !== prev) {
      group += 1;
      prev = date;
    }
    return group % 2 === 1;
  });
}

/** PDF を A4 横で出す。title は「〇〇データ一覧：工場名」、fileName は拡張子なし */
export async function downloadTablePdf<T>(
  columns: ExportColumn<T>[],
  rows: T[],
  opts: { title: string; year: number; month: number; fileName: string; firstPageTop?: number }
) {
  const stripes = dateStripes(columns, rows);
  // 1 ページ目だけ上の余白を変える帳票がある（清掃記録は 96。確定デザイン 7139:164289）。そのぶん 1 ページ目の表は短くする
  const firstTop = opts.firstPageTop ?? PAD;
  const { title } = opts;
  const monthLabel = `${opts.year}年 ${opts.month + 1}月分`;

  // 画面の外に描いて、行の高さを測ってからページに分ける
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:-40000px;top:0;pointer-events:none;";
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<PdfTable columns={columns} rows={rows} stripes={stripes} />));
    await document.fonts?.ready;
    const headH = host.querySelector<HTMLElement>("[data-pdf-head]")!.getBoundingClientRect().height;
    const rowHs = Array.from(host.querySelectorAll<HTMLElement>("[data-pdf-row]")).map((el) => el.getBoundingClientRect().height);

    const pages: number[][] = [];
    let cur: number[] = [];
    let h = headH;
    rows.forEach((_, i) => {
      const maxH = pages.length === 0 ? TABLE_MAX_H - (firstTop - PAD) : TABLE_MAX_H;
      if (cur.length > 0 && h + rowHs[i] > maxH) {
        pages.push(cur);
        cur = [];
        h = headH;
      }
      cur.push(i);
      h += rowHs[i];
    });
    pages.push(cur);

    flushSync(() =>
      root.render(
        <>
          {pages.map((idx, p) => (
            <PdfPage
              key={p}
              title={title}
              monthLabel={monthLabel}
              columns={columns}
              rows={idx.map((i) => rows[i])}
              stripes={idx.map((i) => stripes[i])}
              pageNo={p + 1}
              pageCount={pages.length}
              top={p === 0 ? firstTop : PAD}
            />
          ))}
        </>
      )
    );
    await Promise.all(
      Array.from(host.querySelectorAll("img")).map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined)))
    );
    const pageEls = Array.from(host.querySelectorAll<HTMLElement>("[data-pdf-page]"));
    await downloadPagesAsPdf(pageEls, `${opts.fileName}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}

/* ---------------- 点検の帳票（機械器具点検・清掃記録）の列 ---------------- */

export type LedgerExportRow = {
  /** YYYY-MM-DD */
  date: string;
  lineLabel: string;
  result: LedgerExportResult;
  implementer: string;
  confirmer: string;
  remarks: string;
  /** 詳細の欄。1 要素 1 行 */
  detail: string[];
};

/** 日付 160・持ち場名/ライン名 1000・点検結果/実施者/確認者 200・備考/詳細 残りを半分ずつ */
const LEDGER_COLUMNS: ExportColumn<LedgerExportRow>[] = [
  { header: "日付", width: 160, kind: "date", value: (r) => r.date },
  { header: "持ち場名/ライン名", width: 1000, kind: "name", value: (r) => r.lineLabel },
  { header: "点検結果", width: 200, kind: "result", value: () => "", result: (r) => r.result },
  { header: "実施者", width: 200, kind: "center", value: (r) => r.implementer },
  { header: "確認者", width: 200, kind: "center", value: (r) => r.confirmer },
  { header: "備考", kind: "note", value: (r) => r.remarks },
  { header: "詳細", kind: "note", value: (r) => r.detail },
];

export function downloadLedgerCsv(rows: LedgerExportRow[], fileName: string) {
  downloadTableCsv(LEDGER_COLUMNS, rows, fileName);
}

export function downloadLedgerPdf(
  rows: LedgerExportRow[],
  opts: { title: string; year: number; month: number; fileName: string; firstPageTop?: number }
) {
  return downloadTablePdf(LEDGER_COLUMNS, rows, opts);
}

/* ---------------- 入出庫の帳票（添加物管理・薬品管理）の列 ---------------- */

export type StockExportRow = {
  date: string;
  name: string;
  type: string;
  quantity: string;
  currentStock: string;
  storageLocation: string;
  implementer: string;
  confirmer: string;
  remarks: string;
};

/** 日付 160・〇〇名 600・区分/数量/在庫 200・保管場所/実施者/確認者 250・備考/詳細 残りを半分ずつ。中の文字は太字 */
export function stockColumns(nameHeader: string, stockHeader: string): ExportColumn<StockExportRow>[] {
  return [
    { header: "日付", width: 160, kind: "date", value: (r) => r.date },
    { header: nameHeader, width: 600, kind: "name", bold: true, value: (r) => r.name },
    { header: "区分", width: 200, kind: "center", bold: true, value: (r) => r.type },
    { header: "数量", width: 200, kind: "center", bold: true, value: (r) => r.quantity },
    { header: stockHeader, width: 200, kind: "center", bold: true, value: (r) => r.currentStock },
    { header: "保管場所", width: 250, kind: "center", bold: true, value: (r) => r.storageLocation },
    { header: "実施者", width: 250, kind: "center", bold: true, value: (r) => r.implementer },
    { header: "確認者", width: 250, kind: "center", bold: true, value: (r) => r.confirmer },
    { header: "備考", kind: "note", light: true, value: (r) => r.remarks },
    { header: "詳細", kind: "note", light: true, value: () => "" },
  ];
}
