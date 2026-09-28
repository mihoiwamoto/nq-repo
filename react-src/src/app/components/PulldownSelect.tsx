import { useState } from "react";
import iconArrowDown from "../../assets/figma/icons/common/arrow-down.svg";

/** 表示ラベルと値が同じなら文字列、違うなら { value, label } を渡す */
type PulldownOption<T extends string> = T | { value: T; label: string };

interface PulldownSelectProps<T extends string> {
  value: T | null;
  onChange: (value: T) => void;
  options: readonly PulldownOption<T>[];
  placeholder?: string;
  /** ボタンとリストの幅。既定は w-60 (240px) */
  widthClassName?: string;
}

export function PulldownSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "選択してください",
  widthClassName = "w-60",
}: PulldownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );
  const selectedLabel = items.find((item) => item.value === value)?.label;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`bg-white flex gap-2 h-12 items-center px-4 rounded-lg shrink-0 text-base text-[var(--semantic-text-primary)] ${widthClassName}`}
      >
        <span
          className={`flex-1 text-left truncate ${
            selectedLabel ? "" : "text-[var(--semantic-text-secondary)]"
          }`}
        >
          {selectedLabel ?? placeholder}
        </span>
        <img src={iconArrowDown} alt="" className="size-4 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 top-full bg-white rounded-lg shadow-[0px_0px_3px_rgba(51,51,51,0.24)] p-2 z-50 ${widthClassName}`}
          >
            {items.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 h-[42px] rounded-lg text-base ${
                  item.value === value
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
