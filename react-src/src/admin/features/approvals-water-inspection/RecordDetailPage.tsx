import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, type BreadcrumbItem } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown, type PulldownOption } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { APPROVAL_STATUS_COLOR } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { RejectReasonDialog } from "../../components/RejectReasonDialog";
import { Toast } from "../../components/Toast";
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";
import type { WaterApprovalRecord, WaterCheckResult } from "./types";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";
import { useDemoFactoryName } from "../../data/factoryDemo";

// 本番のプルダウンの選択肢は「承認」。承認したあとの表示は「承認済み」。
// 先頭に押せない「点検済み」を並べる（本番の ApprovalStatus と同じ並び。2026-10-08）
function statusOptions(current: ApprovalStatus): PulldownOption[] {
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
          {/* 本番は原因・対応が無いときは空のまま */}
          <p>原因：{result.cause ?? ""}</p>
          <p>対応：{result.action ?? ""}</p>
        </div>
      )}
      {timestamp && <Timestamp implementer={implementer} timestamp={timestamp} />}
    </div>
  );
}

export function RecordDetailPage() {
  const demoFactoryName = useDemoFactoryName();
  const { recordId } = useParams<{ recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={demoFactoryName}
      breadcrumb={[
        { label: "承認申請管理", to: "/admin/approvals" },
        { label: "データ一覧", to: "/admin/approvals/water-inspection" },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}

/** 詳細の中身。データ検索の詳細（data-search-water-inspection/RecordDetailPage）もこれを使う */
export function RecordDetailView({
  record,
  factoryName,
  breadcrumb,
  setApprovalStatus,
  addComment,
}: {
  record: WaterApprovalRecord | undefined;
  factoryName: string;
  breadcrumb: BreadcrumbItem[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
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

  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentToast, setCommentToast] = useState(false);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  function handleAddComment() {
    if (!record || !newComment.trim()) return;
    // 本番（ApprovalComment の StoreRequest）は 255 文字まで
    if (newComment.trim().length > 255) {
      setCommentError("コメントは255文字以内で指定してください。");
      return;
    }
    setCommentError("");
    addComment(record.id, newComment.trim());
    setNewComment("");
    setCommentToast(true);
  }

  const handleStatusChange = (value: string) => {
    if (value === "approved") {
      requestApproval(() => setApprovalStatus(record.id, value as ApprovalStatus));
    } else if (value === "rejected") {
      requestRejection((reason) => {
        setApprovalStatus(record.id, value as ApprovalStatus);
        // 差し戻し理由はコメントとして残す（本番 ApprovalFlowService::updateApprovalStatus → createComment）
        if (reason) addComment(record.id, reason);
      });
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
      {showToast && <Toast message="更新しました。" onClose={closeToast} />}
      {commentToast && <Toast message="コメントを登録しました。" onClose={() => setCommentToast(false)} />}
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
                {/* 本番は異常（消灯）のとき「異常」と赤字 */}
                {record.uvIndicatorLight === "on" ? "点灯" : "異常"}
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
                {/* 本番は異常（点灯）のとき「異常」と赤字 */}
                {record.abnormalDetectionLight === "on" ? "異常" : "消灯"}
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
          {commentError && <p className="text-sm text-[var(--semantic-brand-danger)]">{commentError}</p>}
        </div>
      </div>
    </div>
  );
}
