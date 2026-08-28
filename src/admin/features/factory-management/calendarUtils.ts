export type MonthCell = {
  day: number;
  monthOffset: -1 | 0 | 1;
  dateKey: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toDateKey(year: number, month: number, day: number) {
  const d = new Date(year, month, day);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function buildMonthGrid(year: number, month: number): MonthCell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: MonthCell[] = [];

  for (let i = startWeekday; i > 0; i--) {
    const day = daysInPrevMonth - i + 1;
    cells.push({ day, monthOffset: -1, dateKey: toDateKey(year, month - 1, day) });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, monthOffset: 0, dateKey: toDateKey(year, month, day) });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, monthOffset: 1, dateKey: toDateKey(year, month + 1, nextDay) });
    nextDay++;
  }

  return cells;
}

export function formatMonthLabel(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
