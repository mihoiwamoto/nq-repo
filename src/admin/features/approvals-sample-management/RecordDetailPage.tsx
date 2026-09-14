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
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string | undefined) {
  return date ? date.replaceAll("-", "/") : "ー";
}

export function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const factoryName = getFactoryName("f1");
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

  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState("");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const handleStatusChange = (value: string) => {
    if (value === "approved") {
      requestApproval(() => setApprovalStatus(record.id, value as ApprovalStatus));
    } else if (value === "rejected") {
      requestRejection(() => setApprovalStatus(record.id, value as ApprovalStatus));
    } else {
      setApprovalStatus(record.id, value as ApprovalStatus);
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
          { label: "データ一覧", to: "/admin/approvals/sample-management" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <Pulldown
            value={record.approvalStatus}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            disabled={record.approvalStatus !== "pending"}
            className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
            style={{ backgroundColor: APPROVAL_STATUS_COLOR[record.approvalStatus] }}
          />
        </div>

        <div className="bg-white flex flex-wrap gap-x-16 gap-y-6 items-center p-4 rounded-lg w-full">
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">製品名</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.productName}</p>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">賞味期限</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{formatDate(record.expirationDate)}</p>
          </div>
          {/* ロットNo. は管理画面で「記載する」とした製品だけに入る任意項目 */}
          {record.lotNumber && (
            <div className="flex flex-col gap-2 items-start">
              <p className="text-sm text-[var(--semantic-text-secondary)]">ロットNo.</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{record.lotNumber}</p>
            </div>
          )}
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
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
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
              {record.date && record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">製造日</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.manufactureDate)}</p>
              {record.manufactureDate && record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">検体種別</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.sampleType}</p>
              {record.sampleType && record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">検体数量</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.sampleQuantity}</p>
              {record.sampleQuantity && record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">単位</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.unit}</p>
              {record.unit && record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">保管場所</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.storageLocation}</p>
              {record.storageLocation && record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
            {record.remarks && (
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">検体状況</p>
          <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">状態</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.status}</p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">破棄日</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.discardedDate)}</p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">理由</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{record.discardReason ?? "ー"}</p>
              </div>
              {record.discardReason === "その他" && record.discardReasonNote && (
                <p className="text-base text-[var(--semantic-text-secondary)]">{record.discardReasonNote}</p>
              )}
            </div>
          </div>
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
