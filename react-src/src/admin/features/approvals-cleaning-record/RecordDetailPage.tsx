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
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";
import type { CleaningApprovalRecord } from "./mockData";
import { getFactoryName } from "../../../data/factories";
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
  const { records, addComment } = useRecords();
  // 承認申請管理の見本は承認ステータスを持たないので画面の中だけで持つ
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={factoryId ? getFactoryName(factoryId) : demoFactoryName}
      breadcrumb={[
        { label: "承認申請管理", to: "/admin/approvals" },
        { label: "データ一覧", to: "/admin/approvals/cleaning-record" },
        { label: "詳細" },
      ]}
      approvalStatus={status}
      setApprovalStatus={(_, next) => setStatus(next)}
      addComment={addComment}
    />
  );
}

/** 詳細の中身。データ検索の詳細（data-search-cleaning-record/RecordDetailPage）もこれを使う */
export function RecordDetailView({
  record,
  factoryName,
  breadcrumb,
  approvalStatus: status,
  setApprovalStatus,
  addComment,
}: {
  record: CleaningApprovalRecord | undefined;
  /** 札に出す工場名（確定デザイン 7139:161756 / 7139:162131） */
  factoryName: string;
  breadcrumb: BreadcrumbItem[];
  approvalStatus: ApprovalStatus;
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, text: string) => void;
}) {
  const [comment, setComment] = useState("");
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

  const locations = record.locations ?? [];
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
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb items={breadcrumb} />
      {/* 確定デザイン（7139:161756・7139:162009）：工場名・状態の行 → 実施日のカードは 16px */}
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
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

        {/* 確定デザイン（7139:161756・7139:162131）：実施日のカード・コメントの間は 40px、備考の見出し → 本文は 8px（2026-10-07） */}
        <div className="flex flex-col gap-10 w-full">
        {/* 確定デザイン（7139:161756）：カードの中は 12px 間隔・行の高さ 28（文字 20px）。
            清掃箇所の帯は高さ 44、清掃項目の行は「項目名と札（88×28）」＋8px＋入力時刻（14px）（2026-10-08） */}
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full [&_p.text-xl]:leading-7">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full -mb-px" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full -mb-px" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full -mb-px" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.lineLabel}</p>
          </div>

          {locations.length > 0 && <div className="border-t border-[#d0d0d0] w-full -mb-px" />}
          {locations.map((location) => (
            <div key={location.name} className="flex flex-col gap-3 w-full">
              {/* 確定デザイン（7139:161756）：緑の帯の左右の余白は 8px */}
              <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between px-2 py-2 rounded-lg w-full">
                <p className="text-xl text-white font-bold">清掃箇所</p>
                <p className="text-xl text-white font-bold">{location.name}</p>
              </div>
              <div className="flex flex-col gap-3 px-2 w-full">
                <p className="text-xl text-[var(--semantic-brand-primary)] font-bold">{location.items[0]?.category}</p>
                {location.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">{item.name}</p>
                      <span className="bg-[#19C95F] h-7 w-[88px] flex items-center justify-center rounded-lg text-base font-semibold text-white whitespace-nowrap shrink-0">
                        清掃済
                      </span>
                    </div>
                    {item.cleaned && (
                      <p className="text-sm leading-[14px] text-[var(--semantic-text-secondary)] font-normal text-right">
                        {item.implementer} {item.timestamp}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#d0d0d0] w-full -mb-px" />
            </div>
          ))}
          {locations.length > 0 && record.remarks && (
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            </div>
          )}
        </div>

        {/* 点検見送りの記録（清掃箇所が無い）は備考を別のカードで出す（確定デザイン 7139:162009 / 7139:162447） */}
        {locations.length === 0 && record.remarks && (
          <div className="bg-white flex flex-col gap-2 items-start px-4 py-6 rounded-lg w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
            <div className="text-base leading-[1.6] text-[var(--semantic-text-primary)] font-normal text-left">
              {!record.cleaned && <p>点検見送り</p>}
              <p>{record.remarks}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          {/* 確定デザイン：承認申請管理（7139:161756）・データ検索（7139:259043 と同じ配置）とも
              見出し → これまでのコメント（古い順） → 入力欄 → 「コメントを残す」 */}
          <CommentInputBox
            value={comment}
            onChange={setComment}
            onSubmit={() => {
              addComment(record.id, comment);
              setComment("");
            }}
            maxLength={255}
            placeholder="コメントを入力"
          />
        </div>
        </div>
      </div>
    </div>
  );
}
