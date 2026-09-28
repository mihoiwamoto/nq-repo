import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { cleaningApprovalRecords } from "./mockData";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

function truncateRemarks(text: string) {
  return text.length >= 26 ? `${text.slice(0, 25)}…` : text;
}

function CleanedIcon({ cleaned }: { cleaned: boolean }) {
  if (!cleaned) {
    return <span className="text-sm text-[var(--semantic-text-primary)]">ー</span>;
  }
  return (
    <span className="size-6 flex items-center justify-center text-[var(--semantic-brand-primary)]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const rowStripeClasses = getDateStripeClasses(cleaningApprovalRecords, (r) => r.date);
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "cleaning-record");

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
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">25年4月1日点検分</p>
            <div className="w-full rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-[1000px]">
                <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                  {["操作", "ステータス", "実施日", "持ち場名/ライン名", "清掃済み", "備考", "実施者", "確認者"].map(
                    (h, i) => (
                      <div
                        key={h}
                        className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${
                          i === 5 ? "flex-1 min-w-[200px]" : i === 3 ? "w-[240px]" : "w-[104px]"
                        }`}
                      >
                        {h}
                      </div>
                    )
                  )}
                </div>
                {cleaningApprovalRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                  >
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <Link
                        to={`/admin/approvals/cleaning-record/records/${record.id}`}
                        className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                      >
                        詳細
                      </Link>
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <ApprovalStatusBadge status="approved" />
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {formatDateShort(record.date)}
                    </div>
                    <div className="w-[240px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                      {record.lineLabel}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <CleanedIcon cleaned={record.cleaned} />
                    </div>
                    <div
                      className="flex-1 min-w-[200px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left"
                      title={record.remarks}
                    >
                      {truncateRemarks(record.remarks)}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                      {record.implementer}
                    </div>
                    <div className="w-[104px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                      {record.confirmer}
                    </div>
                  </div>
                ))}
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
