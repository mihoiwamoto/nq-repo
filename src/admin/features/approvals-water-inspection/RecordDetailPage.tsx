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
import type { WaterCheckResult } from "./types";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function StatusTag({ result }: { result: WaterCheckResult }) {
  const isAbnormal = result.status === "abnormal";
  return (
    <span
      className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${
        isAbnormal ? "bg-[#f85c5c]" : "bg-[#19c95f]"
      }`}
    >
      {isAbnormal ? "異常あり" : "正常"}
    </span>
  );
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function Timestamp({ implementer, timestamp }: { implementer: string; timestamp: string }) {
  return (
    <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
      {implementer} {timestamp}
    </p>
  );
}

function CheckRow({
  label,
  result,
  implementer,
  timestamp,
}: {
  label: string;
  result: WaterCheckResult;
  implementer: string;
  timestamp: string;
}) {
  return (
    <div className="flex flex-col gap-1 items-start w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
        <StatusTag result={result} />
      </div>
      {result.status === "abnormal" && (
        <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
          <p>原因：{result.cause || "不明"}</p>
          <p>対応：{result.action || "記録なし"}</p>
        </div>
      )}
      {timestamp && <Timestamp implementer={implementer} timestamp={timestamp} />}
    </div>
  );
}

export function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
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
  const [newComment, setNewComment] = useState("");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  function handleAddComment() {
    if (!record || !newComment.trim()) return;
    addComment(record.id, newComment.trim());
    setNewComment("");
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
          { label: "データ一覧", to: "/admin/approvals/water-inspection" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
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
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">点検場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.location}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {formatDate(record.date)} {record.time}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <CheckRow
            label="味"
            result={record.taste}
            implementer={record.implementer}
            timestamp={`${formatDate(record.date)} ${record.time}`}
          />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow
            label="臭い"
            result={record.smell}
            implementer={record.implementer}
            timestamp={`${formatDate(record.date)} ${record.time}`}
          />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow
            label="色"
            result={record.color}
            implementer={record.implementer}
            timestamp={`${formatDate(record.date)} ${record.time}`}
          />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow
            label="濁り"
            result={record.turbidity}
            implementer={record.implementer}
            timestamp={`${formatDate(record.date)} ${record.time}`}
          />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow
            label="異物"
            result={record.foreignMatter}
            implementer={record.implementer}
            timestamp={`${formatDate(record.date)} ${record.time}`}
          />
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">ph値</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.ph}</p>
            </div>
            {hasValue(record.ph) && (
              <Timestamp implementer={record.implementer} timestamp={`${formatDate(record.date)} ${record.time}`} />
            )}
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">残留塩素濃度（mg/ℓ）</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.chlorine}</p>
            </div>
            {record.chlorineReplenished && (
              <span className="flex items-center gap-1 text-[#19c95f] text-base">
                <img src={iconCheckmark} alt="" className="size-4" />
                塩素補充
              </span>
            )}
            {hasValue(record.chlorine) && (
              <Timestamp implementer={record.implementer} timestamp={`${formatDate(record.date)} ${record.time}`} />
            )}
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">UV殺菌灯稼働時間（h）</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.uvOperatingHours}</p>
            </div>
            {record.uvLampReplaced && (
              <span className="flex items-center gap-1 text-[#19c95f] text-base">
                <img src={iconCheckmark} alt="" className="size-4" />
                UV殺菌灯交換
              </span>
            )}
            {hasValue(record.uvOperatingHours) && (
              <Timestamp implementer={record.implementer} timestamp={`${formatDate(record.date)} ${record.time}`} />
            )}
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">UV表示灯</p>
              <p
                className={`text-xl ${
                  record.uvIndicatorLight === "off"
                    ? "text-[var(--semantic-brand-danger)]"
                    : "text-[var(--semantic-text-primary)]"
                }`}
              >
                {record.uvIndicatorLight === "on" ? "点灯" : "消灯"}
              </p>
            </div>
            {hasValue(record.uvIndicatorLight) && (
              <Timestamp implementer={record.implementer} timestamp={`${formatDate(record.date)} ${record.time}`} />
            )}
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">異常検出灯</p>
              <p
                className={`text-xl ${
                  record.abnormalDetectionLight === "on"
                    ? "text-[var(--semantic-brand-danger)]"
                    : "text-[var(--semantic-text-primary)]"
                }`}
              >
                {record.abnormalDetectionLight === "on" ? "点灯" : "消灯"}
              </p>
            </div>
            {hasValue(record.abnormalDetectionLight) && (
              <Timestamp implementer={record.implementer} timestamp={`${formatDate(record.date)} ${record.time}`} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          <CommentInputBox value={newComment} onChange={setNewComment} onSubmit={handleAddComment} />
        </div>
      </div>
    </div>
  );
}
