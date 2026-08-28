import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { Pulldown } from "../../components/Pulldown";
import { useRecords } from "./RecordsContext";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";

function formatDate(date: string | undefined) {
  return date ? date.replaceAll("-", "/") : "ー";
}

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[104px]" },
  { label: "実施日", width: "w-[96px]" },
  { label: "製品名", width: "w-[200px]" },
  { label: "賞味期限", width: "w-[96px]" },
  { label: "製造日", width: "w-[96px]" },
  { label: "検体種別", width: "w-[88px]" },
  { label: "検体数量", width: "w-[88px]" },
  { label: "単位", width: "w-[64px]" },
  { label: "保管場所", width: "w-[104px]" },
  { label: "備考", width: "flex-1 min-w-[160px]" },
  { label: "状態", width: "w-[88px]" },
  { label: "破棄日", width: "w-[96px]" },
  { label: "実施者", width: "w-[100px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const { records } = useRecords();

  const [filterOpen, setFilterOpen] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [onlyRejected, setOnlyRejected] = useState(false);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);

  const productOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.productName))),
    [records]
  );

  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-").map(Number);
    if (ry !== year || rm !== month + 1) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (productFilter && r.productName !== productFilter) return false;
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
    setProductFilter("");
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
                      value={productFilter}
                      onChange={setProductFilter}
                      options={productOptions.map((label) => ({ value: label, label }))}
                      placeholder="製品名"
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
                {year}年{month + 1}月
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
              <div className="flex flex-col min-w-[1400px]">
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
                          to={`/admin/approvals/sample-management/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="w-[104px] flex items-center justify-center p-2 h-full">
                        <ApprovalStatusBadge status={record.approvalStatus} />
                      </div>
                      <div className="w-[96px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {formatDate(record.date)}
                      </div>
                      <div className="w-[200px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                        {record.productName}
                      </div>
                      <div className="w-[96px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {formatDate(record.expirationDate)}
                      </div>
                      <div className="w-[96px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {formatDate(record.manufactureDate)}
                      </div>
                      <div className="w-[88px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleType}
                      </div>
                      <div className="w-[88px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleQuantity}
                      </div>
                      <div className="w-[64px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.unit}
                      </div>
                      <div className="w-[104px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                        {record.storageLocation}
                      </div>
                      <div className="flex-1 min-w-[160px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                        {record.remarks}
                      </div>
                      <div className="w-[88px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.status}
                      </div>
                      <div className="w-[96px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {formatDate(record.discardedDate)}
                      </div>
                      <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.implementer}
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
