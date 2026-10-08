import { Link } from "react-router-dom";
import { Toast } from "../../components/Toast";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import type { InspectionResult } from "./types";
import { AdminEmptyState } from "../../components/AdminEmptyState";

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

// 本番（inspects/detector/check/list.blade.php）は check_date->format('y.m.d')（例 25.04.01）
function formatDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(-2)}.${m}.${d}`;
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
  const { records: allRecords, setApprovalStatus } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const rowStripeClasses = getDateStripeClasses(records, (r) => r.date);
  const { showConfirmDialog, showToast, closeToast, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "metal-xray-detection");

  const handleApprove = () => {
    requestApproval(() => {
      if (request) updateApprovalRequestStatus(request.id, "approved");
      // 本番（ApprovalFlowController::approvalBulk）は redirect()->back()：データ一覧に留まり、承認待ちの記録をまとめて承認済みにする
      records.filter((r) => r.approvalStatus === "pending").forEach((r) => setApprovalStatus(r.id, "approved"));
    });
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
      {/* 本番の文言（ApprovalFlowController::approvalBulk の flashSuccess） */}
      {showToast && <Toast message="一括承認が完了しました。" onClose={closeToast} />}
      {/* 本番どおりダウンロードは無い（2026-10-08。content-header に isDownloadButton が無い） */}
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

          {/* 0 件のときの帯は横スクロールの箱の外に出し、見える幅いっぱいに置く（見出しだけ横に動く） */}
          <div className="w-full min-w-0">
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
                {records.length === 0 ? null : (
                  records.map((record, index) => (
                    <div
                      key={record.id}
                      className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="w-[104px] flex items-center justify-center p-2 h-full">
                        <Link
                          to={`/admin/approvals/metal-xray-detection/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
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
            {records.length === 0 && <AdminEmptyState className="mt-2" />}
          </div>
        </div>
        <button
          type="button"
          onClick={handleApprove}
          // 承認待ちが 0 件のときは押せない（2026-10-08 ユーザー指定）
          disabled={records.filter((r) => r.approvalStatus === "pending").length === 0}
          className="bg-[var(--semantic-brand-primary)] disabled:bg-[#d0d0d0] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>
      </div>
    </div>
  );
}
