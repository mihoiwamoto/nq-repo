interface CommentInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonLabel?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function CommentInputBox({
  value,
  onChange,
  onSubmit,
  placeholder = "ここにテキストを入力",
  buttonLabel = "コメントを残す",
  disabled,
  maxLength,
}: CommentInputBoxProps) {
  const isDisabled = disabled ?? !value.trim();

  return (
    // 確定デザイン（2026-10-07）：入力欄は高さ 80px、入力欄 → 「コメントを残す」は 16px。
    // 上（これまでのコメント）との間は置く側の gap で決める（確定デザインは 8px＝gap-2）
    <div className="flex flex-col gap-4 items-start w-full">
      <div className="bg-white rounded-lg w-full p-2">
        <textarea
          value={value}
          onChange={(e) =>
            onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)
          }
          placeholder={placeholder}
          className="block h-16 w-full text-base font-light text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] resize-none outline-none"
        />
      </div>
      {/* 未入力のときは押せない（グレー）、入力すると緑で押せる（2026-10-07 ユーザー指定）。
          Figma の確定デザインと AI書き出しは緑で描いているが、実装はこの挙動 */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="bg-[var(--semantic-brand-primary)] disabled:bg-[#d0d0d0] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
