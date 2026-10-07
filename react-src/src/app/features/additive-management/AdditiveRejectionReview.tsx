import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { CommentInput, type CommentEntry } from "../../components/CommentInput";
import { CompleteDialog } from "../../components/CompleteDialog";
import { DateFilterInput } from "../../components/DateFilterInput";
import { commentTimestamp } from "../../utils/date";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import {
  ADDITIVE_REJECTION_COMMENTS,
  initialRecords,
  type Additive,
  type AdditiveRecord,
} from "./mockData";

/**
 * 確認待ち › 添加物管理の差し戻し（確定デザインに合わせて 2 枚に分けた。2026-10-06。薬品管理の ChemicalRejectionReview と同じ作り）
 *
 * - 一覧（7139:239010・7139:239235）… 実施日・ステータス列のある記録の表・「差し戻し対応完了」。
 *   URL は /app/pending-review/:id
 * - 詳細（7139:238922）… 記録 1 件の中身・コメント・「点検内容を修正する」（実施者を選んで記録入力の「編集を保存」で戻る）。
 *   URL は /app/pending-review/:id/records/:recordId
 *
 * 入口の「確認者を選んでください」と「実施者を選んでください」のポップアップは PendingReviewDetailPage が持つ。
 */

type RecordApproval = "rejected" | "approved" | "pending";

const APPROVAL_LABEL: Record<RecordApproval, string> = {
  rejected: "差し戻し",
  approved: "承認済み",
  pending: "承認待ち",
};

const APPROVAL_COLOR: Record<RecordApproval, string> = {
  rejected: "var(--semantic-brand-danger)",
  approved: "var(--semantic-brand-primary)",
  pending: "var(--semantic-text-secondary)",
};

const COLUMNS = [
  { key: "action", label: "操作", width: 72 },
  { key: "status", label: "ステータス", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 64 },
  { key: "quantity", label: "数量", width: 72 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 0 },
  { key: "actor", label: "実施者", width: 96 },
] as const;

/** 差し戻された記録 = 差し戻し、それより前 = 承認済み、後 = 承認待ち（見本の並び） */
function approvalOf(records: AdditiveRecord[], rejectedId: string | undefined, record: AdditiveRecord): RecordApproval {
  const rejectedIndex = records.findIndex((r) => r.id === rejectedId);
  const index = records.findIndex((r) => r.id === record.id);
  if (index === rejectedIndex) return "rejected";
  return rejectedIndex >= 0 && index < rejectedIndex ? "approved" : "pending";
}

function ScrollEnd({ className, onReachEnd, children }: { className?: string; onReachEnd: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollHeight - el.clientHeight <= 8) onReachEnd();
  });
  return (
    <div
      ref={ref}
      className={className}
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight <= 8) onReachEnd();
      }}
    >
      {children}
    </div>
  );
}

export function AdditiveRejectionReview({
  reviewId,
  additive,
  recordId,
  confirmerName,
  returnState,
  onBackToConfirmer,
  openRejectEdit,
  overlay,
}: {
  reviewId: string;
  additive: Additive;
  /** あれば詳細（2 枚目）を出す */
  recordId?: string;
  confirmerName: string;
  /** 画面を行き来しても確認者の選択を保つための location.state（{ step, confirmerId }） */
  returnState: Record<string, unknown>;
  onBackToConfirmer: () => void;
  /** 「点検内容を修正する」→ 実施者の選択 → 「次へ」で go(実施者名) を呼ぶ */
  openRejectEdit: (go: (actorName: string) => void) => void;
  /** 実施者の選択ポップアップ（PendingReviewDetailPage が描く） */
  overlay?: ReactNode;
}) {
  const navigate = useNavigate();
  const rejection = ADDITIVE_REJECTION_COMMENTS[additive.id];
  const records = initialRecords.filter((r) => r.additiveId === additive.id);
  const listPath = `/app/pending-review/${reviewId}`;
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [responseComplete, setResponseComplete] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [extraComments, setExtraComments] = useState<CommentEntry[]>([]);
  const firstDate = (records.find((r) => r.id === rejection?.recordId) ?? records[0])?.date ?? "2025/04/01";
  const [date, setDate] = useState(firstDate.replaceAll("/", "-"));
  const title = `添加物管理_${additive.name}`;

  const record = recordId ? records.find((r) => r.id === recordId) : undefined;

  if (record) {
    // 添加物の記録は元在庫数を持たないので、1 つ前の記録の現在庫数（最初の記録は添加物の元在庫数）を出す
    const index = records.findIndex((r) => r.id === record.id);
    const previousStock = index > 0 ? records[index - 1].currentStock : additive.initialStock;
    const comments = [...(record.id === rejection?.recordId ? rejection.comments : []), ...extraComments];
    const goToEdit = (actorName: string) => {
      navigate(`/app/ledger-list/additive-management/products/${additive.id}/new`, {
        state: {
          inspectorName: actorName,
          date: record.date,
          editRecord: {
            category: record.category,
            quantity: record.quantity,
            currentStock: record.currentStock,
            remarks: record.remarks,
          },
          editReturn: { to: `${listPath}/records/${record.id}`, state: returnState },
        },
      });
    };
    return (
      <>
        <AppHeader title={title} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4 items-center">
          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
            {(
              [
                ["実施日", record.date],
                ["保管場所", record.storageLocation],
                ["規格", additive.spec],
                ["元在庫数", previousStock],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
            {(
              [
                ["区分", record.category],
                ["数量", record.quantity],
                ["現在庫数", record.currentStock],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
                </div>
                <div className="border-t border-[#d0d0d0] w-full" />
              </div>
            ))}
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base font-normal leading-[1.6] text-[var(--semantic-text-primary)]">{record.remarks}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full">
            <div className="flex h-11 items-center justify-between w-full">
              <p className="text-lg font-semibold text-[var(--semantic-text-primary)]">コメント</p>
              <button
                type="button"
                onClick={() => openRejectEdit(goToEdit)}
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center justify-center h-11 p-3 rounded-lg text-lg font-semibold leading-none text-[var(--semantic-brand-primary)] whitespace-nowrap"
              >
                <img src={iconEdit} alt="" className="size-5" />
                点検内容を修正する
              </button>
            </div>
            <CommentInput
              value={newComment}
              onChange={setNewComment}
              maxLength={255}
              comments={comments}
              onSend={() => {
                if (!newComment.trim()) return;
                setExtraComments((prev) => [
                  ...prev,
                  { id: `local-${prev.length}`, authorName: confirmerName, timestamp: commentTimestamp(), body: newComment.trim() },
                ]);
                setNewComment("");
              }}
            />
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(listPath, { state: returnState })}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
        </div>
        {overlay}
      </>
    );
  }

  return (
    <>
      <AppHeader title={title} />
      {/* 差し戻しの表を最後まで見るまで完了ボタンは押せない（機械器具点検と同じ） */}
      <ScrollEnd
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center"
        onReachEnd={() => setScrolledToEnd(true)}
      >
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
          <img src={iconAttention} alt="注意" className="size-6 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">承認者から差し戻し理由のコメントがあります。</p>
        </div>

        <div className="flex h-12 items-center justify-between w-full max-w-full">
          <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
            実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <DateFilterInput value={date} onChange={setDate} />
        </div>

        <div className="border-t border-[#d0d0d0] w-full" />

        <div className="bg-white rounded-lg overflow-x-auto shrink-0 w-full max-w-full">
          <table className="border-collapse table-fixed w-full">
            <thead>
              <tr className="bg-[var(--semantic-brand-primary)] h-14">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width || "auto" }}
                    className="text-white text-sm font-semibold px-2 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, index) => {
                const approval = approvalOf(records, rejection?.recordId, r);
                return (
                  <tr key={r.id} className={`h-12 ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`${listPath}/records/${r.id}`, { state: returnState })}
                        className="bg-[var(--semantic-brand-primary)] h-8 w-14 rounded-lg text-xs text-white inline-flex items-center justify-center"
                      >
                        詳細
                      </button>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className="inline-flex h-5 px-2 items-center justify-center rounded-lg text-xs text-white whitespace-nowrap"
                        style={{ backgroundColor: APPROVAL_COLOR[approval] }}
                      >
                        {APPROVAL_LABEL[approval]}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">{r.storageLocation}</td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">{r.category}</td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">{r.quantity}</td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">{r.currentStock}</td>
                    <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] truncate">{r.remarks}</td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">{r.actor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ScrollEnd>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={onBackToConfirmer}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!scrolledToEnd}
          onClick={() => setResponseComplete(true)}
          className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
            scrolledToEnd ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          差し戻し対応完了
        </button>
      </div>

      {overlay}

      {responseComplete && (
        <CompleteDialog
          title="差し戻し対応が完了しました"
          message="ご確認ありがとうございます。"
          buttonLabel="確認待ちに戻る"
          onButtonClick={() => navigate("/app/pending-review")}
        />
      )}
    </>
  );
}
