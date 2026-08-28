import { useEffect, useRef, useState } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
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

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSelect(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white h-12 px-4 rounded-lg text-base w-full text-left text-black flex items-center justify-between border border-[#d0d0d0] ${className}`}
      >
        <span>{value || placeholder}</span>
        <span className="text-lg">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-[#d0d0d0] rounded-b-lg shadow-[0px_2px_8px_rgba(51,51,51,0.16)] z-10">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2 text-left text-base transition-colors ${
                  value === option
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "text-black hover:bg-[#f0f0f0]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
