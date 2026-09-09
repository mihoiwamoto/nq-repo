import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { APPROVAL_STATUS_COLOR } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { RejectReasonDialog } from "../../components/RejectReasonDialog";
import { Toast } from "../../components/Toast";
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

export function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { records, addComment } = useRecords();
  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<ApprovalStatus>("approved");
  const {
    showConfirmDialog,
    showRejectDialog,
    showToast,
    closeToast,
    requestApproval,
    confirmApproval,
    cancelApproval,
    requestRejection,
    confirmRejection,
    cancelRejection,
  } = useApprovalConfirm();

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const handleStatusChange = (value: string) => {
    if (value === "approved") {
      requestApproval(() => setStatus(value as ApprovalStatus));
    } else if (value === "rejected") {
      requestRejection(() => setStatus(value as ApprovalStatus));
    } else {
      setStatus(value as ApprovalStatus);
    }
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
      {showRejectDialog && (
        <RejectReasonDialog onCancel={cancelRejection} onConfirm={confirmRejection} />
      )}
      {showToast && <Toast message="承認ステータスを更新しました。" onClose={closeToast} />}
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: "/admin/approvals/cleaning-record" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.lineLabel}</p>
          </div>
          <Pulldown
            value={status}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            disabled={status !== "pending"}
            className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
            style={{ backgroundColor: APPROVAL_STATUS_COLOR[status] }}
          />
        </div>

        <div className="bg-white flex flex-col gap-4 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.lineLabel}</p>
          </div>

          {record.locations && record.locations.length > 0 && (
            <div className="flex flex-col items-start w-full border-t border-[#d0d0d0] pt-0">
            {record.locations.map((location, locIdx) => (
              <div key={location.name} className={`w-full ${locIdx < record.locations.length - 1 ? "mb-6" : ""}`}>
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between px-4 py-2 rounded-lg w-full">
                  <p className="text-xl text-white font-bold">清掃箇所</p>
                  <p className="text-xl text-white font-bold">{location.name}</p>
                </div>
                <div className="bg-white flex flex-col px-4 pt-3 pb-0 rounded-none w-full">
                  <p className="text-xl text-[var(--semantic-brand-primary)] font-bold mb-2">{location.items[0]?.category}</p>
                  {location.items.map((item, idx) => (
                    <div key={idx} className={idx === location.items.length - 1 ? "pb-0" : ""}>
                      <div className="flex items-start justify-between py-2 gap-4">
                        <p className="text-xl text-[var(--semantic-text-primary)]">{item.name}</p>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            className="bg-[#19C95F] h-10 px-4 rounded-lg text-base text-white whitespace-nowrap"
                          >
                            清掃済
                          </button>
                          <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                            {item.implementer} {item.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-[#d0d0d0] w-full mt-0" />
                </div>
              </div>
            ))}
            {record.remarks && (
              <div className="flex flex-col gap-3 items-start w-full mt-3">
                <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
                <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                  {record.remarks}
                </p>
              </div>
            )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          <CommentInputBox
            value={comment}
            onChange={setComment}
            onSubmit={() => {
              addComment(record.id, comment);
              setComment("");
            }}
            maxLength={255}
          />
        </div>
      </div>
    </div>
  );
}
