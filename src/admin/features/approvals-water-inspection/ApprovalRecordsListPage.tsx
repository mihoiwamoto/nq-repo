import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { Pulldown } from "../../components/Pulldown";
import { useRecords } from "./RecordsContext";
import type { WaterCheckResult, WaterApprovalRecord } from "./types";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";
import iconXMark from "../../../assets/figma/icons/common/x-mark.svg";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

function CheckCell({ result, width }: { result: WaterCheckResult; width: number }) {
  const isAbnormal = result.status === "abnormal";
  return (
    <div
      className={`flex items-center justify-center p-2 h-full shrink-0 ${isAbnormal ? "bg-[#f85c5c]" : ""}`}
      style={{ width }}
    >
      {isAbnormal ? (
        <img
          src={iconXMark}
          alt="異常あり"
          className="size-5"
        />
      ) : (
        <span className="text-[var(--semantic-brand-primary)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  );
}

function ChlorineCell({ record, width }: { record: WaterApprovalRecord; width: number }) {
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        補充
      </span>
    </div>
  );
}

const COLUMNS = [
  { key: "action", label: "操作", width: 96 },
  { key: "status", label: "ステータス", width: 104 },
  { key: "date", label: "日付", width: 80 },
  { key: "time", label: "点検時間", width: 72 },
  { key: "location", label: "点検場所", width: 100 },
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

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const { records } = useRecords();

  const [filterOpen, setFilterOpen] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [onlyRejected, setOnlyRejected] = useState(false);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);

  const locationOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.location))),
    [records]
  );

  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-").map(Number);
    if (ry !== year || rm !== month + 1) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (locationFilter && r.location !== locationFilter) return false;
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
    setLocationFilter("");
    setOnlyRejected(false);
  }

  return (
    <div>
      <PageTitleBar title="データ一覧" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
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
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
                    />
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
                    className="bg-white border border-[#808080] h-10 w-20 rounded-lg text-sm text-[var(--semantic-text-secondary)]"
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

          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex items-center justify-between w-full">
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
              <p className="text-xl text-[var(--semantic-text-primary)]">
                {year}年{month + 1}月_使用水の点検
              </p>
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
            </div>
            <div className="w-full rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-[1300px]">
                <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                  {COLUMNS.map((c) => (
                    <div
                      key={c.key}
                      className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] text-center shrink-0"
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
                      className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-center p-2 h-full shrink-0" style={{ width: 96 }}>
                        <Link
                          to={`/admin/approvals/water-inspection/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="flex items-center justify-center p-2 h-full shrink-0" style={{ width: 104 }}>
                        <ApprovalStatusBadge status={record.approvalStatus} />
                      </div>
                      <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 80 }}>
                        {formatDateShort(record.date)}
                      </div>
                      <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 72 }}>
                        {record.time}
                      </div>
                      <div className="flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] shrink-0" style={{ width: 100 }}>
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
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/approvals")}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>
      </div>
    </div>
  );
}
