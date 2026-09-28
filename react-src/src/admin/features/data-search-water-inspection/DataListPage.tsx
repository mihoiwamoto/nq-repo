import { useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { DateFilterInput } from "../../components/DateFilterInput";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { getDateStripeClasses } from "../../utils/tableStripe";
import type { WaterCheckResult, WaterSearchRecord } from "./types";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";
import iconXMark from "../../../assets/figma/icons/common/x-mark.svg";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconDownload from "../../../assets/figma/icons/common/download.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconSearch from "../../../assets/figma/icons/common/search.svg";
import { downloadElementAsPdf } from "../../utils/pdf";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

function CheckboxMarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 12.5L10.2 15.5L17 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChlorineCell({ record, width }: { record: WaterSearchRecord; width: number }) {
  if (!record.chlorineReplenished) {
    return (
      <div
        className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0"
        style={{ width }}
      >
        {record.chlorine}
      </div>
    );
  }
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 p-2 h-full shrink-0 bg-[#f85c5c]"
      style={{ width }}
    >
      <span className="text-base font-bold text-white">{record.chlorine}</span>
      <span className="flex items-center gap-1 text-xs text-white">
        <CheckboxMarkIcon />
        補充
      </span>
    </div>
  );
}

function CheckCell({ result, width }: { result: WaterCheckResult; width: number }) {
  const isAbnormal = result.status === "abnormal";
  return (
    <div
      className={`flex items-center justify-center h-full shrink-0 ${isAbnormal ? "bg-[#f85c5c]" : "p-2"}`}
      style={{ width }}
    >
      <img
        src={isAbnormal ? iconXMark : iconCheckmark}
        alt={isAbnormal ? "異常あり" : "正常"}
        className="size-5"
      />
    </div>
  );
}

function isRecordAbnormal(record: WaterSearchRecord) {
  return (
    record.taste.status === "abnormal" ||
    record.smell.status === "abnormal" ||
    record.color.status === "abnormal" ||
    record.turbidity.status === "abnormal" ||
    record.foreignMatter.status === "abnormal"
  );
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const COLUMNS = [
  { key: "action", label: "操作", width: 96 },
  { key: "date", label: "日付", width: 80 },
  { key: "time", label: "点検時間", width: 72 },
  { key: "location", label: "点検場所", width: 80 },
  { key: "taste", label: "味", width: 48 },
  { key: "smell", label: "臭い", width: 48 },
  { key: "color", label: "色", width: 48 },
  { key: "turbidity", label: "濁り", width: 48 },
  { key: "foreignMatter", label: "異物", width: 48 },
  { key: "ph", label: "ph値", width: 48 },
  { key: "chlorine", label: "残留塩素濃度（mg/ℓ）", width: 100 },
  { key: "uvHours", label: "UV殺菌灯稼働時間", width: 100 },
  { key: "uvLight", label: "UV表示灯", width: 100 },
  { key: "abnormalLight", label: "異常検出灯", width: 100 },
  { key: "implementer", label: "実施者", width: 100 },
  { key: "confirmer", label: "確認者", width: 100 },
];

export function DataListPage() {
  const { factoryId, pointId } = useParams<{ factoryId: string; pointId: string }>();
  const { records: allRecords } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const factoryName = getFactoryName(factoryId);
  const location = pointId ? decodeURIComponent(pointId) : "";
  const basePath = `/admin/data-search/water-inspection/factories/${factoryId}/points/${pointId}`;

  const [year, setYear] = useState(2025);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "pdf">("csv");
  const tableRef = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(3);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);

  const locationOptions = useMemo(
    () => Array.from(new Set(records.filter((r) => r.location === location).map((r) => r.location))),
    [records, location]
  );

  const filtered = records.filter((r) => {
    if (r.location !== location) return false;
    const [ry, rm] = r.date.split("-").map(Number);
    if (ry !== year || rm !== month + 1) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (locationFilter && r.location !== locationFilter) return false;
    if (onlyAbnormal && !isRecordAbnormal(r)) return false;
    return true;
  });
  const rowStripeClasses = getDateStripeClasses(filtered, (r) => r.date);

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function handleReset() {
    setDateFilter("");
    setLocationFilter("");
    setOnlyAbnormal(false);
  }

  function handleDownload() {
    const header = COLUMNS.filter((c) => c.key !== "action").map((c) => c.label);
    const rows = filtered.map((r) => [
      r.date,
      r.time,
      r.location,
      r.taste.status === "normal" ? "正常" : "異常あり",
      r.smell.status === "normal" ? "正常" : "異常あり",
      r.color.status === "normal" ? "正常" : "異常あり",
      r.turbidity.status === "normal" ? "正常" : "異常あり",
      r.foreignMatter.status === "normal" ? "正常" : "異常あり",
      String(r.ph),
      String(r.chlorine),
      String(r.uvOperatingHours),
      r.uvIndicatorLight === "on" ? "点灯" : "消灯",
      r.abnormalDetectionLight === "on" ? "点灯" : "消灯",
      r.implementer,
      r.confirmer,
    ]);
    downloadCsv([header, ...rows], `使用水の点検_${location}_${year}${String(month + 1).padStart(2, "0")}.csv`);
  }

  return (
    <div>
      <PageTitleBar
        title="データ一覧"
        showBack
        action={
          <button
            type="button"
            onClick={() => setDownloadDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center text-[var(--semantic-brand-primary)]"
            title="CSVダウンロード"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconDownload}")`,
                maskImage: `url("${iconDownload}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "currentColor",
              }}
            />
          </button>
        }
      />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/water-inspection" },
          { label: "点検場所選択", to: `/admin/data-search/water-inspection/factories/${factoryId}` },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col gap-10 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{location}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-2 text-base text-[var(--semantic-brand-primary)]"
          >
            <span>絞り込み検索</span>
            {filterOpen ? (
              <span
                aria-hidden
                className="inline-block size-5 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconMinus}")`,
                  maskImage: `url("${iconMinus}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            ) : (
              <span>+</span>
            )}
          </button>
          {filterOpen && (
            <div className="flex gap-6 items-center justify-end w-full">
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-4 items-center">
                  <DateFilterInput value={dateFilter} onChange={setDateFilter} />
                  <Pulldown
                    value={locationFilter}
                    onChange={setLocationFilter}
                    options={locationOptions.map((label) => ({ value: label, label }))}
                    placeholder="点検場所"
                  />
                </div>
                <label className="flex gap-2 items-center text-base text-[var(--semantic-text-secondary)]">
                  <input
                    type="checkbox"
                    checked={onlyAbnormal}
                    onChange={(e) => setOnlyAbnormal(e.target.checked)}
                    className="size-4 accent-[var(--semantic-brand-primary)]"
                  />
                  異常があるものだけ表示
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white border border-[#808080] h-10 w-20 rounded-lg text-sm text-[var(--semantic-text-secondary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)]"
                >
                  リセット
                </button>
                <button
                  type="button"
                  className="bg-[var(--semantic-brand-primary)] h-10 w-[120px] rounded-lg text-base text-white flex items-center justify-center gap-1 shadow-[0px_2px_2px_rgba(51,51,51,0.24)]"
                >
                  <img src={iconSearch} alt="" className="size-5" />
                  検索
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconArrowLeft}")`,
                maskImage: `url("${iconArrowLeft}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "var(--semantic-brand-primary)",
              }}
            />
          </button>
          <button
            type="button"
            onClick={() => setMonthPickerOpen((v) => !v)}
            className="flex items-center gap-1 text-xl text-[var(--semantic-text-primary)]"
          >
            {year}年{month + 1}月
            <span
              aria-hidden
              className="inline-block size-3 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconPulldown}")`,
                maskImage: `url("${iconPulldown}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "currentColor",
              }}
            />
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconArrowRight}")`,
                maskImage: `url("${iconArrowRight}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "var(--semantic-brand-primary)",
              }}
            />
          </button>

          {monthPickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMonthPickerOpen(false)} />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-center p-4 w-[392px]">
                <div className="flex items-center justify-between py-2 w-full">
                  <button
                    type="button"
                    onClick={() => setYear((y) => y - 1)}
                    className="text-[var(--semantic-text-primary)] text-xl"
                  >
                    <span
                      aria-hidden
                      className="inline-block size-5 shrink-0"
                      style={{
                        WebkitMaskImage: `url("${iconArrowLeft}")`,
                        maskImage: `url("${iconArrowLeft}")`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        backgroundColor: "currentColor",
                      }}
                    />
                  </button>
                  <p className="text-xl text-[var(--semantic-text-primary)]">{year}</p>
                  <button
                    type="button"
                    onClick={() => setYear((y) => y + 1)}
                    className="text-[var(--semantic-text-primary)] text-xl"
                  >
                    <span
                      aria-hidden
                      className="inline-block size-5 shrink-0"
                      style={{
                        WebkitMaskImage: `url("${iconArrowRight}")`,
                        maskImage: `url("${iconArrowRight}")`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        backgroundColor: "currentColor",
                      }}
                    />
                  </button>
                </div>
                <div className="flex flex-wrap w-[360px]">
                  {MONTH_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setMonth(i);
                        setMonthPickerOpen(false);
                      }}
                      className={`h-12 w-[120px] flex items-center justify-center text-base ${
                        i === month
                          ? "bg-[var(--semantic-brand-primary)] text-white"
                          : "text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div ref={tableRef} className="w-full rounded-lg overflow-x-auto">
          <div className="flex flex-col min-w-[1216px]">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center">
              {COLUMNS.map((c) => (
                <div
                  key={c.key}
                  className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] text-center shrink-0 ${
                    c.key === "confirmer" ? "pr-6" : ""
                  }`}
                  style={{ width: c.width }}
                >
                  {c.label}
                </div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                該当するデータがありません
              </p>
            ) : (
              filtered.map((record, index) => (
                <div
                  key={record.id}
                  className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                >
                  <div className="flex items-center justify-center p-2 h-full shrink-0" style={{ width: 96 }}>
                    <Link
                      to={`${basePath}/records/${record.id}`}
                      className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                    >
                      詳細
                    </Link>
                  </div>
                  <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 80 }}>
                    {formatDateShort(record.date)}
                  </div>
                  <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 72 }}>
                    {record.time}
                  </div>
                  <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 80 }}>
                    {record.location}
                  </div>
                  <CheckCell result={record.taste} width={48} />
                  <CheckCell result={record.smell} width={48} />
                  <CheckCell result={record.color} width={48} />
                  <CheckCell result={record.turbidity} width={48} />
                  <CheckCell result={record.foreignMatter} width={48} />
                  <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0 whitespace-nowrap" style={{ width: 48 }}>
                    {record.ph}
                  </div>
                  <ChlorineCell record={record} width={100} />
                  <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 100 }}>
                    {record.uvOperatingHours}
                  </div>
                  <div
                    className={`flex items-center justify-center p-2 h-full text-sm shrink-0 ${
                      record.uvIndicatorLight === "off"
                        ? "text-[var(--semantic-brand-danger)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                    style={{ width: 100 }}
                  >
                    {record.uvIndicatorLight === "on" ? "点灯" : "消灯"}
                  </div>
                  <div
                    className={`flex items-center justify-center p-2 h-full text-sm shrink-0 ${
                      record.abnormalDetectionLight === "on"
                        ? "text-[var(--semantic-brand-danger)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                    style={{ width: 100 }}
                  >
                    {record.abnormalDetectionLight === "on" ? "点灯" : "消灯"}
                  </div>
                  <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 100 }}>
                    {record.implementer}
                  </div>
                  <div className="flex items-center justify-center p-2 pr-6 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 100 }}>
                    {record.confirmer}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {downloadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDownloadDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-[640px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
              ダウンロード形式選択
            </h2>
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">
                ダウンロード形式を選択してください
              </p>
              <div className="flex w-full rounded-lg overflow-hidden border border-[#d0d0d0]">
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-center px-6 py-4 text-white text-base w-[160px] shrink-0">
                  ファイル形式
                </div>
                <div className="bg-white flex flex-col gap-3 justify-center px-6 py-4 flex-1">
                  <label className="flex items-center gap-2 text-base text-[var(--semantic-text-primary)]">
                    <input
                      type="radio"
                      name="downloadFormat"
                      value="csv"
                      checked={downloadFormat === "csv"}
                      onChange={() => setDownloadFormat("csv")}
                    />
                    CSV形式
                  </label>
                  <label className="flex items-center gap-2 text-base text-[var(--semantic-text-primary)]">
                    <input
                      type="radio"
                      name="downloadFormat"
                      value="pdf"
                      checked={downloadFormat === "pdf"}
                      onChange={() => setDownloadFormat("pdf")}
                    />
                    PDF形式
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDownloadDialogOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (downloadFormat === "csv") {
                    handleDownload();
                  } else if (tableRef.current) {
                    await downloadElementAsPdf(tableRef.current, `使用水の点検_${location}_${year}${String(month + 1).padStart(2, "0")}.pdf`);
                  }
                  setDownloadDialogOpen(false);
                }}
                className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
