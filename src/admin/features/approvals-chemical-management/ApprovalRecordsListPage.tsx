import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { Pulldown } from "../../components/Pulldown";
import { DateFilterInput } from "../../components/DateFilterInput";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import type { ChemicalTransactionType } from "./types";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[104px]" },
  { label: "日付", width: "w-[80px]" },
  { label: "薬品名", width: "w-[104px]" },
  { label: "区分", width: "w-[104px]" },
  { label: "数量", width: "w-[104px]" },
  { label: "現在庫数", width: "w-[104px]" },
  { label: "保管場所", width: "w-[104px]" },
  { label: "備考", width: "flex-1 min-w-[200px]" },
  { label: "実施者", width: "w-[100px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "chemical-management");

  const [filterOpen, setFilterOpen] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [chemicalFilter, setChemicalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<ChemicalTransactionType | "">("");
  const [onlyRejected, setOnlyRejected] = useState(false);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);

  const chemicalOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.chemicalName))),
    [records]
  );

  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-").map(Number);
    if (ry !== year || rm !== month + 1) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (chemicalFilter && r.chemicalName !== chemicalFilter) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (onlyRejected && r.approvalStatus !== "rejected") return false;
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
    setChemicalFilter("");
    setTypeFilter("");
    setOnlyRejected(false);
  }

  const handleApprove = () => {
    requestApproval(() => {
      if (request) updateApprovalRequestStatus(request.id, "approved");
      navigate("/admin/approvals", { state: { statusChanged: "approved" } });
    });
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
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
                    <DateFilterInput value={dateFilter} onChange={setDateFilter} />
                    <Pulldown
                      value={chemicalFilter}
                      onChange={setChemicalFilter}
                      options={chemicalOptions.map((label) => ({ value: label, label }))}
                      placeholder="薬品名"
                    />
                    <Pulldown
                      value={typeFilter}
                      onChange={(value) => setTypeFilter(value as ChemicalTransactionType | "")}
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
                {year}年{month + 1}月_次亜塩素酸ナトリウム
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
                      className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="w-[104px] flex items-center justify-center p-2 h-full">
                        <Link
                          to={`/admin/approvals/chemical-management/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
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
                        {record.chemicalName}
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
                      <div className="w-[104px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                        {record.storageLocation}
                      </div>
                      <div className="flex-1 min-w-[200px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                        {record.remarks}
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
          onClick={handleApprove}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>
      </div>
    </div>
  );
}
