import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "選択してください",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-[240px] ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full flex items-center justify-between border border-[#d0d0d0] hover:opacity-80"
      >
        <span className={value ? "text-[var(--semantic-text-primary)]" : "text-[#808080]"}>
          {selectedLabel}
        </span>
        <svg
          className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.9422 18.4924C12.507 19.1887 11.493 19.1887 11.0578 18.4924L3.0625 5.7C2.59997 4.95994 3.13201 4 4.00472 4L19.9953 4C20.868 4 21.4 4.95995 20.9375 5.7L12.9422 18.4924Z"
            fill="#333333"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#d0d0d0] rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.15)] z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value === "" ? null : option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-base hover:bg-[#f1efea] transition-colors ${
                value === option.value
                  ? "bg-[#009944] text-white"
                  : `${option.value === "" ? "text-[#808080]" : "text-[var(--semantic-text-primary)]"}`
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
