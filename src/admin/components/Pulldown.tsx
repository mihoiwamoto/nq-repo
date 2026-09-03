import { useEffect, useRef, useState, type CSSProperties } from "react";
import iconPulldown from "../../assets/figma/icons/common/pulldown.svg";

export type PulldownOption = { value: string; label: string };

const DEFAULT_TRIGGER_CLASSNAME =
  "bg-white border border-[#d0d0d0] h-12 px-8 rounded-lg text-base text-[var(--semantic-text-primary)] w-full";

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`${className ?? DEFAULT_TRIGGER_CLASSNAME} flex items-center justify-between gap-2 disabled:text-[var(--semantic-text-secondary)] disabled:cursor-not-allowed`}
        style={style}
      >
        <span className={`truncate ${!selectedLabel ? 'text-[var(--semantic-text-secondary)]' : ''}`}>{triggerLabel}</span>
        <img
          src={iconPulldown}
          alt=""
          aria-hidden
          className={`inline-block size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{
            filter: 'invert(0.7) brightness(1.2)',
          }}
        />
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
