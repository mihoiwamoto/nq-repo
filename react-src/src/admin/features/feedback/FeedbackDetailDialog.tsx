/**
 * フィードバック管理の詳細ポップアップ。
 *
 * 一覧のカードを押すと開く。1 件ぶんの中身をすべてここで見せ、
 * ステータスの変更・削除・コメントのやり取りもこの中で完結させる。
 *
 * 構成は「見出し（No./種類/日時/削除）」→「ステータス」→「報告者・ページ」
 * →「本文」→「コメント」。
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { screenBreadcrumb } from "../../../components/feedback/screenBreadcrumb";
import {
  COMPANY_LABELS,
  COMPANY_ORDER,
  KIND_LABELS,
  STATUS_CHIP_CLASS,
  STATUS_LABELS,
  STATUS_ORDER,
  companyLabel,
  feedbackDetail,
  feedbackHeadline,
  initialAuthor,
  initialCompany,
  saveFeedbackAuthor,
  saveFeedbackCompany,
  type FeedbackCompany,
  type FeedbackEntry,
  type FeedbackKind,
  type FeedbackStatus,
} from "../../../components/feedback/feedbackStore";

/** 種類ごとのバッジ色（一覧・フィードバックパネルと合わせる） */
export const KIND_STYLES: Record<FeedbackKind, string> = {
  bug: "bg-[#fdecec] text-[#c8322b]",
  improvement: "bg-[#e6f5ec] text-[var(--semantic-brand-primary)]",
  question: "bg-[#e8f1fd] text-[#2f6fc4]",
  other: "bg-[#eeeeee] text-[var(--semantic-text-secondary)]",
};

/** 「2026-08-28 14:33」 */
export function formatStamp(at: number): string {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const IconClose = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const IconTrash = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M10 4h4M9.5 7l.6 12M14.5 7l-.6 12M6.5 7l.8 13.2a1 1 0 001 .8h7.4a1 1 0 001-.8L18.5 7" />
  </svg>
);

const IconExternal = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </svg>
);

const IconSend = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 3L3 10.5l7 3 3 7L21 3z" />
    <path d="M10 13.5L21 3" />
  </svg>
);

export function FeedbackDetailDialog({
  entry,
  onChangeStatus,
  onRemove,
  onAddComment,
  onClose,
}: {
  entry: FeedbackEntry;
  onChangeStatus: (status: FeedbackStatus) => void;
  onRemove: () => void;
  onAddComment: (author: string, body: string, company: FeedbackCompany) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [company, setCompany] = useState<FeedbackCompany>(() => initialCompany());
  const [author, setAuthor] = useState(() => initialAuthor());
  const [comment, setComment] = useState("");

  // Esc で閉じる（一覧に戻る）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const detail = feedbackDetail(entry);
  const comments = entry.comments ?? [];

  const submit = () => {
    const body = comment.trim();
    if (!body) return;
    const who = author.trim();
    if (who) saveFeedbackAuthor(who);
    saveFeedbackCompany(company);
    onAddComment(who, body, company);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[760px] max-w-full">
        {/* 閉じる。カードの内側・見出し行の右端にそろえる（枠のない控えめなアイコンボタン）。
            中身のスクロールで流れないよう、カードの外側に置いて位置だけ重ねている。 */}
        <button
          type="button"
          onClick={onClose}
          title="閉じる"
          aria-label="閉じる"
          className="absolute top-7 right-8 z-10 size-9 rounded-md flex items-center justify-center text-[var(--semantic-text-secondary)] hover:bg-[#f0f0f0] hover:text-[var(--semantic-text-primary)]"
        >
          <IconClose className="w-5 h-5" />
        </button>

        <div
          role="dialog"
          aria-modal="true"
          aria-label={`No.${entry.no} ${feedbackHeadline(entry)}`}
          className="bg-white rounded-lg shadow-[0px_2px_8px_rgba(51,51,51,0.28)] max-h-[86vh] overflow-y-auto px-8 py-7 flex flex-col gap-5"
        >
          {/* No. / 種類 / 日時 / 削除。右端は閉じるボタンのぶんだけ空けておく */}
          <div className="flex items-center gap-3 flex-wrap pr-12">
            <span className="h-7 font-normal text-[var(--semantic-text-secondary)] text-xs flex items-center">No.{entry.no}</span>
            <span className={`h-7 px-2.5 rounded-md text-sm flex items-center ${KIND_STYLES[entry.kind]}`}>{KIND_LABELS[entry.kind]}</span>
            <span className="text-sm font-normal text-[var(--semantic-text-secondary)]">{formatStamp(entry.createdAt)}</span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={onRemove}
              title="削除する"
              aria-label={`No.${entry.no} を削除する`}
              className="size-9 rounded-md flex items-center justify-center text-[var(--semantic-brand-danger)] hover:bg-[#fdecec]"
            >
              <IconTrash className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl text-[var(--semantic-text-primary)] break-words">{feedbackHeadline(entry)}</h2>

          {/* ステータス（押すとその場で変わる） */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-base text-[var(--semantic-text-secondary)] whitespace-nowrap">ステータス：</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((s) => {
                const active = entry.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChangeStatus(s)}
                    className={`h-8 px-3 rounded-md text-sm ${STATUS_CHIP_CLASS[s]} ${
                      active ? "" : "opacity-40 font-normal hover:opacity-70"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ページ */}
          <dl className="flex flex-col gap-3 text-base">
            <Row label="ページ">
              {/* ボタンの名前はパンくず（管理画面 › ログ管理）。同じ文字を下に繰り返さない */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(entry.pathname);
                }}
                className="min-h-10 px-3.5 py-2 rounded-lg border border-[var(--semantic-brand-primary)] text-sm text-left text-[var(--semantic-brand-primary)] w-fit max-w-full flex items-center gap-2 hover:bg-[#eef8f1]"
              >
                <IconExternal className="w-4 h-4 shrink-0" />
                {screenBreadcrumb(entry.pathname, entry.screenTitle).join(" › ")} で確認
              </button>
            </Row>
          </dl>

          {/* 書かれた内容。コメントの箱と同じ並び: 日時を左上、タイトル・本文、報告者を右下 */}
          <div className="bg-[#f5f5f5] rounded-lg px-5 py-4 flex flex-col gap-2">
            <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{formatStamp(entry.createdAt)}</p>
            <p className="text-base leading-relaxed break-words text-[var(--semantic-text-primary)]">{feedbackHeadline(entry)}</p>
            {detail && (
              <p className="text-base font-normal leading-relaxed whitespace-pre-wrap break-words text-[var(--semantic-text-primary)]">{detail}</p>
            )}
            <p className="text-sm font-normal text-right break-words text-[var(--semantic-text-secondary)]">
              {[companyLabel(entry.company), entry.author].filter(Boolean).join(" ") || "（記入者未入力）"}
            </p>
          </div>

          {/* コメント */}
          <section className="flex flex-col gap-3">
            <h3 className="text-base text-[var(--semantic-text-primary)]">コメント</h3>

            {comments.length === 0 ? (
              <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">まだコメントはありません</p>
            ) : (
              /* 依頼の箱と同じ並び: 日時を左上、本文、書いた人を右下 */
              <ul className="flex flex-col gap-3">
                {comments.map((c) => (
                  <li key={c.id} className="border border-[#eee] rounded-lg px-4 py-3 flex flex-col gap-1">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{formatStamp(c.createdAt)}</p>
                    <p className="text-base font-normal leading-relaxed whitespace-pre-wrap break-words text-[var(--semantic-text-primary)]">{c.body}</p>
                    <p className="text-sm font-normal text-right break-words text-[var(--semantic-text-secondary)]">
                      {[companyLabel(c.company), c.author].filter(Boolean).join(" ") || "（名前なし）"}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {/* 所属（会社）＋ お名前。どちらも見出しを付けて、次回のために覚えておく */}
            <div className="flex gap-2">
              <label className="flex flex-col gap-1.5 w-[160px] shrink-0">
                <span className="text-xs text-[var(--semantic-text-secondary)]">所属</span>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value as FeedbackCompany)}
                  className="h-11 px-3 rounded-lg border border-[#d0d0d0] bg-white text-base font-normal text-[var(--semantic-text-primary)] w-full outline-none focus:border-[var(--semantic-brand-primary)]"
                >
                  {COMPANY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {COMPANY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="text-xs text-[var(--semantic-text-secondary)]">お名前</span>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="お名前"
                  className="h-11 px-4 rounded-lg border border-[#d0d0d0] bg-white text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] w-full outline-none focus:border-[var(--semantic-brand-primary)]"
                />
              </label>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを入力してください"
              rows={4}
              aria-label="コメント本文"
              className="px-4 py-3 rounded-lg border border-[#d0d0d0] bg-white text-base font-normal leading-relaxed text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-disabled)] resize-none outline-none focus:border-[var(--semantic-brand-primary)]"
            />
            <button
              type="button"
              onClick={submit}
              disabled={comment.trim() === ""}
              className="h-12 rounded-lg bg-[var(--semantic-brand-primary)] text-base text-white flex items-center justify-center gap-2 disabled:bg-[#cfe6d8] disabled:text-white/80"
            >
              <IconSend className="w-5 h-5" />
              コメントを送信
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <dt className="w-20 shrink-0 text-base text-[var(--semantic-text-secondary)]">{label}</dt>
      <dd className="flex-1 min-w-0">{children}</dd>
    </div>
  );
}
