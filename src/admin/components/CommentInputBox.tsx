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
    <>
      <div className="bg-white rounded-lg w-full p-2">
        <textarea
          value={value}
          onChange={(e) =>
            onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)
          }
          placeholder={placeholder}
          rows={3}
          className="w-full text-base font-light text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] resize-none outline-none"
        />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="bg-[var(--semantic-brand-primary)] disabled:bg-[#d0d0d0] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
      >
        {buttonLabel}
      </button>
    </>
  );
}
