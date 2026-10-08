import { useLayoutEffect, useState } from "react";
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
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";
import type { AdditiveApprovalRecord } from "./types";
import { useDemoFactoryName } from "../../data/factoryDemo";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

export function RecordDetailPage() {
  const demoFactoryName = useDemoFactoryName();
  const { factoryId, recordId } = useParams<{ factoryId?: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={factoryId ? getFactoryName(factoryId) : demoFactoryName}
      breadcrumb={[
        { label: "承認申請管理", to: "/admin/approvals" },
        { label: "データ一覧", to: "/admin/approvals/additive-management" },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}

/** 詳細の中身。データ検索の詳細（data-search-additive-management/RecordDetailPage）もこれを使う */
export function RecordDetailView({
  record,
  factoryName,
  breadcrumb,
  setApprovalStatus,
  addComment,
  mode = "approval",
}: {
  /** "search" はデータ検索の詳細。承認ステータスのプルダウンとコメントの入力欄は承認申請管理と同じに出し、
   *  入力欄の見本の文字だけ確定デザイン 7139:259043 の「コメントを入力」にする（2026-10-07） */
  mode?: "approval" | "search";
  record: AdditiveApprovalRecord | undefined;
  factoryName: string;
  breadcrumb: BreadcrumbItem[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, text: string) => void;
}) {
  // 開いたときは画面の上から見せる（一覧で下のほうの「詳細」を押しても、右上の承認ステータスが見えるように。2026-10-05）
  useLayoutEffect(() => {
    const toTop = () => {
      const main = document.querySelector("main");
      if (main) main.scrollTop = 0;
    };
    toTop();
    requestAnimationFrame(toTop);
  }, [record?.id]);

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
  const isSearch = mode === "search";

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
      {showToast && <Toast message="更新されました。" onClose={closeToast} />}
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
            options={STATUS_OPTIONS}
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
            <p className="text-xl text-[var(--semantic-text-primary)]">添加物名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.additiveName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">保管場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.storageLocation}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">区分</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.type}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">元在庫数</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.previousStock}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">数量</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.quantity}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">現在庫数</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.currentStock}</p>
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

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          {/* 確定デザイン：承認申請管理（7139:163707）は入力欄の見本の文字が「コメント・補足事項を入力できます（任意）」、
              データ検索（7139:259043 と同じ配置）は「コメントを入力」 */}
          <CommentInputBox
            value={comment}
            onChange={setComment}
            onSubmit={() => {
              addComment(record.id, comment);
              setComment("");
            }}
            maxLength={255}
            placeholder={isSearch ? "コメントを入力" : "コメント・補足事項を入力できます（任意）"}
          />
        </div>
      </div>
    </div>
  );
}
