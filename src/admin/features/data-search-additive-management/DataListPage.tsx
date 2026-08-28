import { useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import type { AdditiveTransactionType } from "./types";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconDownload from "../../../assets/figma/icons/common/download.svg";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";
import { downloadElementAsPdf } from "../../utils/pdf";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
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
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[104px]" },
  { label: "日付", width: "w-[80px]" },
  { label: "添加物名", width: "w-[104px]" },
  { label: "区分", width: "w-[104px]" },
  { label: "数量", width: "w-[104px]" },
  { label: "現在庫数", width: "w-[104px]" },
  { label: "保管場所", width: "w-[104px]" },
  { label: "備考", width: "flex-1 min-w-[200px]" },
  { label: "実施者", width: "w-[100px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function DataListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/additive-management/factories/${factoryId}`;

  const [filterOpen, setFilterOpen] = useState(true);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "pdf">("csv");
  const tableRef = useRef<HTMLDivElement>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [additiveFilter, setAdditiveFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdditiveTransactionType | "">("");
  const [onlyRejected, setOnlyRejected] = useState(false);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const additiveOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.additiveName))),
    [records]
  );

  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-").map(Number);
    if (ry !== year || rm !== month + 1) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (additiveFilter && r.additiveName !== additiveFilter) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (onlyRejected && r.approvalStatus !== "rejected") return false;
    return true;
  });

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function handleReset() {
    setDateFilter("");
    setAdditiveFilter("");
    setTypeFilter("");
    setOnlyRejected(false);
  }

  function handleDownload() {
    const header = ["日付", "添加物名", "区分", "数量", "現在庫数", "保管場所", "備考", "実施者", "確認者", "ステータス"];
    const rows = filtered.map((r) => [
      r.date,
      r.additiveName,
      r.type,
      r.quantity,
      r.currentStock,
      r.storageLocation,
      r.remarks,
      r.implementer,
      r.confirmer,
      r.approvalStatus,
    ]);
    downloadCsv([header, ...rows], `データ一覧_${year}${String(month + 1).padStart(2, "0")}.csv`);
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
          { label: "工場選択", to: "/admin/data-search/additive-management" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col gap-10 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
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
                className="inline-block size-4 shrink-0"
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
            <div className="flex gap-6 items-end justify-between w-full">
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-4 items-center">
                  <div className="relative w-[200px]">
                    <div className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base w-full flex items-center">
                      {!dateFilter && (
                        <span className="text-base text-[var(--semantic-text-secondary)]">
                          日付を選択
                        </span>
                      )}
                      {dateFilter && (
                        <span className="text-base text-[var(--semantic-text-primary)]">
                          {dateFilter.replaceAll("-", "/")}
                        </span>
                      )}
                      <img
                        src={iconCalendar}
                        alt=""
                        className="w-5 h-5 ml-auto"
                      />
                    </div>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                  <Pulldown
                    value={additiveFilter}
                    onChange={setAdditiveFilter}
                    options={additiveOptions.map((label) => ({ value: label, label }))}
                    placeholder="添加物名"
                  />
                  <Pulldown
                    value={typeFilter}
                    onChange={(value) => setTypeFilter(value as AdditiveTransactionType | "")}
                    options={[
                      { value: "入庫", label: "入庫" },
                      { value: "出庫", label: "出庫" },
                    ]}
                    placeholder="区分"
                  />
                </div>
                <label className="flex gap-2 items-center text-base text-[var(--semantic-text-secondary)]">
                  <input
                    type="checkbox"
                    checked={onlyRejected}
                    onChange={(e) => setOnlyRejected(e.target.checked)}
                    className="size-4 accent-[var(--semantic-brand-primary)]"
                  />
                  差し戻しのものだけ表示
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white border border-[#808080] h-10 w-16 rounded-lg text-sm text-[var(--semantic-text-secondary)]"
                >
                  リセット
                </button>
                <button
                  type="button"
                  className="bg-[var(--semantic-brand-primary)] h-10 w-[120px] rounded-lg text-sm text-white"
                >
                  検索
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between relative">
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
            <div className="flex flex-col min-w-[1100px]">
              <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                {COLUMNS.map((col) => (
                  <div
                    key={col.label}
                    className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width}`}
                  >
                    {col.label}
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
                    className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                  >
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <Link
                        to={`${basePath}/records/${record.id}`}
                        className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                      >
                        詳細
                      </Link>
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <ApprovalStatusBadge status={record.approvalStatus} />
                    </div>
                    <div className="w-[80px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {formatDateShort(record.date)}
                    </div>
                    <div className="w-[104px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                      {record.additiveName}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.type}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.quantity}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.currentStock}
                    </div>
                    <div className="w-[104px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.storageLocation}
                    </div>
                    <div className="flex-1 min-w-[200px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.remarks}
                    </div>
                    <div className="w-[100px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.implementer}
                    </div>
                    <div className="w-[100px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {record.confirmer}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                    await downloadElementAsPdf(tableRef.current, `データ一覧_${year}${String(month + 1).padStart(2, "0")}.pdf`);
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
