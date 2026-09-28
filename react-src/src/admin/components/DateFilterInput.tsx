import { useEffect, useRef, useState } from "react";
import iconCalendar from "../../assets/figma/icons/common/calendar.svg";

function DateFilterPicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange(selectedDate.toISOString().split("T")[0]);
    onClose();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthYear = currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

  return (
    <div ref={containerRef} className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4 w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={handlePrevMonth} className="px-2 py-1 hover:bg-gray-100 rounded">
          ←
        </button>
        <div className="text-base font-semibold text-[var(--semantic-text-primary)]">{monthYear}</div>
        <button type="button" onClick={handleNextMonth} className="px-2 py-1 hover:bg-gray-100 rounded">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-[var(--semantic-text-secondary)] p-1">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const dayDateString = day
            ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
            : null;
          const isSelected = day !== null && value === dayDateString;
          return (
            <button
              key={index}
              type="button"
              onClick={() => day && handleSelectDate(day)}
              disabled={!day}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${
                day
                  ? `text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-brand-primary)] hover:text-white cursor-pointer ${
                      isSelected ? "bg-[var(--semantic-brand-primary)] text-white" : ""
                    }`
                  : "text-gray-300"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateFilterInput({
  value,
  onChange,
  placeholder = "日付を選択",
  className = "w-[200px]",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? value.replaceAll("-", "/") : "";

  return (
    <div className={`relative ${className}`}>
      <label className="relative flex items-center">
        {!value && (
          <span className="absolute left-4 font-bold text-base text-[var(--semantic-text-secondary)] pointer-events-none">
            {placeholder}
          </span>
        )}
        <input
          type="text"
          value={displayValue}
          readOnly
          className="bg-white border border-[#d0d0d0] h-12 px-4 pr-12 rounded-lg text-base text-[var(--semantic-text-primary)] w-full cursor-pointer"
        />
        <img
          src={iconCalendar}
          alt=""
          className="absolute right-4 w-5 h-5 cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
      </label>
      {isOpen && <DateFilterPicker value={value} onChange={onChange} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
