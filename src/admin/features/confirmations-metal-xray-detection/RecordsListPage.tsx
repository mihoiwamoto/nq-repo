import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { DateFilterInput } from "../../components/DateFilterInput";
import { ConfirmStatusBadge } from "../../components/ConfirmStatusBadge";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { getDateStripeClasses } from "../../utils/tableStripe";
import type { ConfirmStatus, InspectionResult } from "./types";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconSearch from "../../../assets/figma/icons/common/search.svg";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";

const STATUS_OPTIONS: { value: ConfirmStatus; label: string }[] = [
  { value: "unconfirmed", label: "点検済み" },
  { value: "confirmed", label: "承認待ち" },
];

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[96px]" },
  { label: "実施日", width: "w-[111px]" },
  { label: "点検構成名", width: "flex-1 min-w-[200px]" },
  { label: "結果", width: "w-[80px]" },
  { label: "確認者", width: "w-[100px]" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function ResultIcon({ result }: { result: InspectionResult }) {
  if (result === "OK") {
    return <img src={iconCheckmark} alt="OK" className="w-6 h-6" />;
  }
  return null;
}

export function RecordsListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/confirmations/metal-xray-detection/factories/${factoryId}`;

  const [filterOpen, setFilterOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [machineFilter, setMachineFilter] = useState("");
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const machineOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.machineName))),
    [records]
  );

  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-").map(Number);
    if (ry !== year || rm !== month + 1) return false;
    if (statusFilter && r.confirmStatus !== statusFilter) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (machineFilter && r.machineName !== machineFilter) return false;
    if (onlyAbnormal && r.result !== "NG") return false;
    return true;
  });
  const rowStripeClasses = getDateStripeClasses(filtered, (r) => r.date);

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function handleReset() {
    setStatusFilter("");
    setDateFilter("");
    setMachineFilter("");
    setOnlyAbnormal(false);
  }

  return (
    <div>
      <PageTitleBar title="データ一覧" showBack />
      <Breadcrumb
        items={[
          { label: "確認管理", to: "/admin/confirmations" },
          { label: "工場選択", to: "/admin/confirmations/metal-xray-detection" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
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
                  <Pulldown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={STATUS_OPTIONS}
                    placeholder="ステータス"
                  />
                  <DateFilterInput value={dateFilter} onChange={setDateFilter} />
                  <Pulldown
                    value={machineFilter}
                    onChange={setMachineFilter}
                    options={machineOptions.map((label) => ({ value: label, label }))}
                    placeholder="点検構成名"
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

        <div className="w-full rounded-lg overflow-x-auto">
          <div className="flex flex-col min-w-[900px]">
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
                <div key={record.id} className={`flex h-14 items-center ${rowStripeClasses[index]}`}>
                  <div className="w-[104px] flex items-center justify-center p-2 h-full">
                    <Link
                      to={`${basePath}/records/${record.id}`}
                      className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                    >
                      詳細
                    </Link>
                  </div>
                  <div className="w-[96px] flex items-center justify-center p-2 h-full">
                    <ConfirmStatusBadge status={record.confirmStatus} />
                  </div>
                  <div className="w-[111px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                    {formatDate(record.date)}
                  </div>
                  <div className="flex-1 min-w-[200px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                    {record.machineName}
                  </div>
                  <div className="w-[80px] flex items-center justify-center p-2 h-full">
                    <ResultIcon result={record.result} />
                  </div>
                  <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                    {record.confirmer}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
