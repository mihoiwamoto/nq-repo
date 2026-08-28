import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { useRecords } from "./RecordsContext";
import type { InspectionResult } from "./types";

const RESULT_LABELS: Record<InspectionResult, string> = { OK: "正常", NG: "異常あり" };
const RESULT_COLORS: Record<InspectionResult, string> = {
  OK: "var(--semantic-status-success)",
  NG: "var(--semantic-status-error)",
};

function ResultTag({ result }: { result: InspectionResult }) {
  return (
    <span
      className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
      style={{ backgroundColor: RESULT_COLORS[result] }}
    >
      {RESULT_LABELS[result]}
    </span>
  );
}

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function overallResult(record: { records: { result: InspectionResult }[] }): InspectionResult {
  return record.records.some((r) => r.result === "NG") ? "NG" : "OK";
}

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[104px]" },
  { label: "実施日", width: "w-[96px]" },
  { label: "点検構成名", width: "flex-1 min-w-[200px]" },
  { label: "結果", width: "w-[104px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const { records } = useRecords();

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
            <p className="text-xl text-[var(--semantic-text-primary)]">25年4月1日点検分</p>
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
              {records.length === 0 ? (
                <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                  該当するデータがありません
                </p>
              ) : (
                records.map((record, index) => (
                  <div
                    key={record.id}
                    className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                  >
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <Link
                        to={`/admin/approvals/metal-xray-detection/records/${record.id}`}
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
                    <div className="flex-1 min-w-[200px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                      {record.machineName}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <ResultTag result={overallResult(record)} />
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
