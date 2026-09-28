import { useState } from "react";
import iconSend from "../../assets/figma/icons/common/send.svg";
import { commentTimestamp } from "../utils/date";

export type CommentEntry = {
  id: string;
  authorName: string;
  timestamp: string;
  body: string;
};

/**
 * 投稿済みコメント 1 件のカード。
 * 白背景 / 角丸 8px / 左右 16px・上下 24px、投稿者名は緑・日時はグレー。
 */
export function CommentCard({ comment }: { comment: CommentEntry }) {
  return (
    <div className="bg-white flex flex-col gap-6 items-end px-4 py-6 rounded-lg w-full">
      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex flex-col gap-[5px] items-start w-full">
          <span className="text-base font-semibold leading-none text-[var(--semantic-brand-primary)]">
            {comment.authorName}
          </span>
          <span className="text-xs font-normal leading-none text-[var(--semantic-text-secondary)]">
            {comment.timestamp}
          </span>
        </div>
        <p className="text-base font-normal leading-[1.6] text-[var(--semantic-text-primary)] w-full">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

type CommentInputProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  /**
   * 投稿済みコメント。渡すと入力欄の上にカードで並ぶ。
   * 渡さない場合は、この画面で送信したコメントを内部で保持して表示する。
   */
  comments?: CommentEntry[];
  /** 送信ボタンを押したときの処理。省略時は内部のコメント一覧に追記する。 */
  onSend?: () => void;
  /** onSend を省略したときに、投稿者名として表示する名前。 */
  authorName?: string;
  placeholder?: string;
  className?: string;
};

/**
 * アプリ共通のコメント欄。
 * 投稿済みコメントのカード + 白背景 68px の入力枠 + 緑の送信ボタン + 右寄せの文字数カウンタ。
 */
export function CommentInput({
  value,
  onChange,
  maxLength,
  comments,
  onSend,
  authorName = "",
  placeholder = "コメントを入力",
  className = "",
}: CommentInputProps) {
  const [postedComments, setPostedComments] = useState<CommentEntry[]>([]);
  const shownComments = comments ?? postedComments;
  const canSend = value.trim().length > 0;

  function handleSend() {
    if (!canSend) return;
    if (onSend) {
      onSend();
      return;
    }
    setPostedComments((prev) => [
      ...prev,
      {
        id: `local-${prev.length}`,
        authorName,
        timestamp: commentTimestamp(),
        body: value.trim(),
      },
    ]);
    onChange("");
  }

  return (
    <div className={`flex flex-col gap-6 items-start w-full max-w-full ${className}`}>
      {shownComments.length > 0 && (
        <div className="flex flex-col gap-4 items-start w-full">
          {shownComments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-start w-full">
        <div className="flex gap-2 items-stretch w-full">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            placeholder={placeholder}
            rows={2}
            className="flex-1 min-w-0 bg-white h-[68px] p-2 rounded-lg resize-none text-base font-normal leading-[1.6] text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="bg-[var(--semantic-brand-primary)] w-16 shrink-0 rounded-lg flex items-center justify-center"
            aria-label="コメントを送信"
          >
            <img src={iconSend} alt="" className="size-5" />
          </button>
        </div>
        <span className="text-sm leading-6 text-[var(--semantic-text-primary)] text-right w-full">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
