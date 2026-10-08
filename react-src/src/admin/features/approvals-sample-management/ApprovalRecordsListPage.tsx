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
import { useDemoFactoryName } from "../../data/factoryDemo";
import { AdminEmptyState } from "../../components/AdminEmptyState";

/* 本番（reports/approvals/specimen/index.blade.php）：実施日は y.m.d（例 25.04.01）、
   ロットNo.・賞味期限・製造日は無ければ空欄 */
function shortDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(-2)}.${m}.${d}`;
}

function DateDisplay({ date }: { date: string | undefined }) {
  if (!date) return null;
  return <>{date.replaceAll("-", "/")}</>;
}

/* 列は本番どおり 操作・ステータス・実施日・製品名・ロットNo.・賞味期限・製造日・検体種別・検体数量・単位・保管場所・確認者
   （備考・状態・破棄日・実施者は出さない。詳細画面には出す） */
const COLUMNS: { label: string; width: string }[] = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[96px]" },
  { label: "実施日", width: "w-[111px]" },
  { label: "製品名", width: "flex-1 min-w-[280px]" },
  { label: "ロットNo.", width: "w-[111px]" },
  { label: "賞味期限", width: "w-[111px]" },
  { label: "製造日", width: "w-[111px]" },
  { label: "検体種別", width: "w-[80px]" },
  { label: "検体数量", width: "w-[80px]" },
  { label: "単位", width: "w-[80px]" },
  { label: "保管場所", width: "w-[120px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const demoFactoryName = useDemoFactoryName();
  const { records: allRecords, setApprovalStatus } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const { showConfirmDialog, showToast, closeToast, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "sample-management");

  const rowStripeClasses = getDateStripeClasses(records, (r) => r.date);

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
      <PageTitleBar
        title="データ一覧"
        showBack
      />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[var(--semantic-text-primary)]">{demoFactoryName}</p>
          </div>
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">25年4月点検分</p>
            <div className="w-full rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-[1384px]">
                <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                  {COLUMNS.map((col) => (
                    <div
                      key={col.label}
                      className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width} ${col.width.startsWith("flex-1") ? "" : "shrink-0"}`}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>
                {records.length === 0 ? (
                  <AdminEmptyState className="mt-2" />
                ) : (
                  records.map((record, index) => (
                    <div
                      key={record.id}
                      className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="w-[104px] shrink-0 flex items-center justify-center p-2 h-full">
                        <Link
                          to={`/admin/approvals/sample-management/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="w-[96px] shrink-0 flex items-center justify-center p-2 h-full">
                        <ApprovalStatusBadge status={record.approvalStatus} />
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {shortDate(record.date)}
                      </div>
                      <div className="flex-1 min-w-[280px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left whitespace-nowrap overflow-hidden text-ellipsis" title={record.productName}>
                        {record.productName}
                      </div>
                      {/* ロットNo. は管理画面で「記載する」とした製品だけに入る任意項目 */}
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.lotNumber ?? ""}
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.expirationDate} />
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.manufactureDate} />
                      </div>
                      <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleType}
                      </div>
                      <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleQuantity}
                      </div>
                      <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.unit}
                      </div>
                      <div className="w-[120px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.storageLocation}
                      </div>
                      <div className="w-[100px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
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
