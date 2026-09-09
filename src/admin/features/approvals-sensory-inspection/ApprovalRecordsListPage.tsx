import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import { CRITERIA, isAbnormalScore, type Criterion, type SensoryApprovalRecord } from "./types";

function averageScore(record: SensoryApprovalRecord, criterion: Criterion) {
  const scores = record.scoreEntries.map((entry) => entry.scores[criterion].score);
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function isRecordAbnormal(record: SensoryApprovalRecord) {
  return record.scoreEntries.some((entry) => CRITERIA.some((c) => isAbnormalScore(entry.scores[c].score)));
}

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "日付", width: "w-[80px]" },
  { label: "検査製品名", width: "w-[240px]" },
  ...CRITERIA.map((c) => ({ label: c, width: "w-[64px]" })),
  { label: "検査結果", width: "w-[80px]" },
  { label: "確認者", width: "flex-1 min-w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const rowStripeClasses = getDateStripeClasses(records, (r) => r.date);
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "sensory-inspection");

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
            <p className="text-xl text-[var(--semantic-text-primary)]">25年4月1日点検分</p>
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
              {records.length === 0 ? (
                <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                  該当するデータがありません
                </p>
              ) : (
                records.map((record, index) => {
                  const abnormal = isRecordAbnormal(record);
                  return (
                    <div
                      key={record.id}
                      className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="w-[104px] flex items-center justify-center p-2 h-full">
                        <Link
                          to={`/admin/approvals/sensory-inspection/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="w-[80px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.date.replaceAll("-", "/")}
                      </div>
                      <div className="w-[240px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                        {record.productName}
                      </div>
                      {CRITERIA.map((c) => (
                        <div
                          key={c}
                          className="w-[64px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]"
                        >
                          {averageScore(record, c).toFixed(1)}
                        </div>
                      ))}
                      <div
                        className={`w-[80px] flex items-center justify-center p-2 h-full ${abnormal ? "bg-[#f85c5c]" : ""}`}
                      >
                        {abnormal ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_97_469484)">
                              <path d="M9.97969 12L4.92893 6.94928C4.37104 6.39139 4.37104 5.48687 4.92893 4.92898C5.48682 4.37109 6.39135 4.37109 6.94924 4.92898L12 9.97974L17.0508 4.92898C17.6087 4.37109 18.5132 4.37109 19.0711 4.92898C19.629 5.48687 19.629 6.39139 19.0711 6.94928L14.0203 12L19.0711 17.0508C19.629 17.6087 19.629 18.5132 19.0711 19.0711C18.5132 19.629 17.6087 19.629 17.0508 19.0711L12 14.0204L6.94924 19.0711C6.39134 19.629 5.48682 19.629 4.92893 19.0711C4.37104 18.5132 4.37104 17.6087 4.92893 17.0508L9.97969 12Z" fill="white"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_97_469484">
                                <rect width="24" height="24" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-[100px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.confirmer}
                      </div>
                    </div>
                  );
                })
              )}
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
