import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, type BreadcrumbItem } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { APPROVAL_STATUS_COLOR } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { RejectReasonDialog } from "../../components/RejectReasonDialog";
import { Toast } from "../../components/Toast";
import { approvalRequests } from "../../data/approvals";
import { useRecords } from "./RecordsContext";
import { RepairStatusSection } from "./RepairStatusSection";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";
import type { RepairStatus, ScaleApprovalRecord } from "./types";

/**
 * 本番の approval.blade.php と同じ並び（点検済み・承認待ち・差し戻し・承認）。
 * 点検済みは本番では選べない（disabled。共通の Pulldown の disabled の選択肢で灰色にする）。
 * 「承認」は承認済みのときだけ「承認済み」と出す。
 */
function statusOptions(current: ApprovalStatus): { value: string; label: string; disabled?: boolean }[] {
  return [
    { value: "checked", label: "点検済み", disabled: true },
    { value: "pending", label: "承認待ち" },
    { value: "rejected", label: "差し戻し" },
    { value: "approved", label: current === "approved" ? "承認済み" : "承認" },
  ];
}

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

/** 本番の ScaleInspectionStatus：異常のときは修理状況で 修理中／要対応／異常あり に分ける */
function CheckStatusTag({ status, repairStatus }: { status: "ok" | "ng"; repairStatus?: RepairStatus | null }) {
  const label =
    status === "ok"
      ? "正常"
      : repairStatus === "repairing"
        ? "修理中"
        : repairStatus === "action_needed" || repairStatus == null
          ? "要対応"
          : "異常あり";
  const bg =
    status === "ok" ? "bg-[#19c95f]" : repairStatus === "repairing" ? "bg-[var(--semantic-status-caution)]" : "bg-[#f85c5c]";
  return (
    <span className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${bg}`}>
      {label}
    </span>
  );
}

function Dash() {
  return <span className="inline-block w-3 h-px bg-[#333]" />;
}

const HLine = () => <div className="border-t border-[#d0d0d0] w-full" />;

export function RecordDetailPage() {
  const { requestId, recordId } = useParams<{ requestId: string; recordId: string }>();
  const { records, setApprovalStatus, setRepairStatus, addComment } = useRecords();
  const request = approvalRequests.find((r) => r.id === requestId);
  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={request?.companyName ?? "工場"}
      breadcrumb={[
        { label: "承認申請管理", to: "/admin/approvals" },
        { label: "データ一覧", to: `/admin/approvals/scale-inspection/${requestId}` },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      setRepairStatus={setRepairStatus}
      addComment={addComment}
    />
  );
}

/** 詳細の中身。データ検索の詳細（data-search-scale-inspection/RecordDetailPage）もこれを使う */
export function RecordDetailView({
  record,
  factoryName,
  breadcrumb,
  setApprovalStatus,
  setRepairStatus,
  addComment,
}: {
  record: ScaleApprovalRecord | undefined;
  factoryName: string;
  breadcrumb: BreadcrumbItem[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  setRepairStatus: (id: string, status: RepairStatus) => void;
  addComment: (id: string, text: string) => void;
}) {
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

  const [comment, setComment] = useState("");
  const [showCommentToast, setShowCommentToast] = useState(false);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const isNg = !record.skipped && record.operationCheck === "ng";

  const handleStatusChange = (value: string) => {
    if (value === "approved") {
      requestApproval(() => setApprovalStatus(record.id, value as ApprovalStatus));
    } else if (value === "rejected") {
      requestRejection((reason) => {
        setApprovalStatus(record.id, value as ApprovalStatus);
        // 差し戻し理由はコメントとして残す（本番 ApprovalFlowService::updateApprovalStatus → createComment）
        if (reason) addComment(record.id, reason);
      });
    }
    // 点検済み・承認待ちは選んでも何もしない（本番は承認待ちから 承認・差し戻し にだけ変えられる）
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
      {showRejectDialog && (
        <RejectReasonDialog onCancel={cancelRejection} onConfirm={confirmRejection} />
      )}
      {showToast && <Toast message="更新しました。" onClose={closeToast} />}
      {showCommentToast && <Toast message="コメントを登録しました。" onClose={() => setShowCommentToast(false)} />}
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb items={breadcrumb} />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <Pulldown
            value={record.approvalStatus}
            onChange={handleStatusChange}
            options={statusOptions(record.approvalStatus)}
            disabled={record.approvalStatus !== "pending"}
            className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
            style={{ backgroundColor: APPROVAL_STATUS_COLOR[record.approvalStatus] }}
          />
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.scaleLabel}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">シリアルナンバー</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.serialNumber}</p>
          </div>
          <HLine />

          {record.skipped ? (
            <>
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2 items-start">
                  <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                  <p className="text-base text-[var(--semantic-text-secondary)]">
                    使用分銅(g)：{record.referenceWeight}
                  </p>
                </div>
                <Dash />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
                  <CheckStatusTag status={record.operationCheck} repairStatus={record.repairStatus} />
                </div>
                {isNg && (
                  <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
                    <p>原因：{record.operationCause}</p>
                    <p>対応：{record.operationAction}</p>
                  </div>
                )}
                {record.operationCheckTime && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                    {record.implementer} {record.operationCheckTime}
                  </p>
                )}
              </div>
              <HLine />
              {isNg ? (
                <>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                    <Dash />
                  </div>
                  <HLine />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                    <Dash />
                  </div>
                  <HLine />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                      <p className="text-base text-[var(--semantic-text-secondary)]">
                        使用分銅(g)：{record.referenceWeight}
                      </p>
                    </div>
                    <Dash />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                      <CheckStatusTag status={record.levelCheck ?? "ok"} />
                    </div>
                    {record.levelCheckTime && (
                      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                        {record.implementer} {record.levelCheckTime}
                      </p>
                    )}
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                      <CheckStatusTag status={record.dirtCheck ?? "ok"} />
                    </div>
                    {record.dirtCheckTime && (
                      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                        {record.implementer} {record.dirtCheckTime}
                      </p>
                    )}
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-2 items-start">
                        <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                        <p className="text-base text-[var(--semantic-text-secondary)]">
                          使用分銅(g)：{record.referenceWeight}
                        </p>
                      </div>
                      <p
                        className={`text-xl ${
                          record.weightCause ? "text-[#f85c5c]" : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {record.displayValue}
                      </p>
                    </div>
                    {record.weightCause && (
                      <p className="text-base text-[var(--semantic-text-secondary)] px-2">
                        原因：{record.weightCause}
                      </p>
                    )}
                    {record.displayValueTime && (
                      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                        {record.implementer} {record.displayValueTime}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          <HLine />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
            {record.remarks && (
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            )}
          </div>
        </div>

        <RepairStatusSection records={[record]} setRepairStatus={setRepairStatus} />

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          <CommentInputBox
            value={comment}
            onChange={setComment}
            onSubmit={() => {
              addComment(record.id, comment);
              setComment("");
              setShowCommentToast(true);
            }}
            maxLength={255}
          />
        </div>
      </div>
    </div>
  );
}
