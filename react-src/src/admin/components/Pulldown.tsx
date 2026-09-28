import { useEffect, useRef, useState, type CSSProperties } from "react";
import iconPulldown from "../../assets/figma/icons/common/pulldown.svg";

export type PulldownOption = { value: string; label: string };

const DEFAULT_TRIGGER_CLASSNAME =
  "bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]";

function getArrowFilterColor(className?: string, backgroundColor?: string | CSSProperties): string {
  const hasWhiteText = className?.includes('text-white');
  if (hasWhiteText) return 'brightness(0) invert(1)';

  const bgColor = String(backgroundColor).toLowerCase();
  const darkColors = ['#f85c5c', '#ff6b6b', '#ff4444', '#d32f2f', 'rgb(248, 92, 92)', 'rgb(255, 107, 107)'];
  const isDarkBg = darkColors.some(color => bgColor.includes(color.replace('#', '')) || bgColor.includes(color));

  return isDarkBg ? 'brightness(0) invert(1)' : 'invert(0.7) brightness(1.2)';
}

export function Pulldown({
  value,
  onChange,
  options,
  placeholder,
  className,
  style,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PulldownOption[];
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  const selectedLabel = options.find((option) => option.value === value)?.label;
  const triggerLabel = selectedLabel ?? placeholder ?? "";

  return (
    // data-nq-part は画面説明のコーチマーク（coachMarks.ts）が入力欄の 1 つとして数えるための印。見た目には影響しない
    <div ref={containerRef} data-nq-part="pulldown" className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`${className ?? DEFAULT_TRIGGER_CLASSNAME} flex items-center gap-2 disabled:cursor-not-allowed`}
        style={style}
      >
        <span
          className={`flex-1 min-w-0 text-left truncate ${
            !selectedLabel
              ? className?.includes('text-white')
                ? 'font-bold'
                : 'text-[var(--semantic-text-secondary)] font-bold'
              : ''
          }`}
        >
          {triggerLabel}
        </span>
        {!disabled && (
          <img
            src={iconPulldown}
            alt=""
            aria-hidden
            className={`inline-block size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            style={{
              filter: getArrowFilterColor(className, (style as any)?.backgroundColor),
            }}
          />
        )}
      </button>
      {open && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg p-2 min-w-full w-max max-w-[calc(100vw-32px)] max-h-[290px] overflow-y-auto z-50" style={{ pointerEvents: "auto" }}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => select(option.value)}
              className={`flex h-[42px] items-center px-2 rounded-lg w-full text-left text-base whitespace-nowrap ${
                value === option.value
                  ? "bg-[var(--semantic-brand-primary)] text-white"
                  : "text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
