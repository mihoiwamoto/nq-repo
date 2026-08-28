import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { ChecklistItem, Line, ScheduleEntry } from "./types";
import { initialChecklistItems, initialEntries, initialLines } from "./mockData";

type ScheduleContextValue = {
  lines: Line[];
  entries: Record<string, ScheduleEntry>;
  upsertEntry: (dateKey: string, lineIds: string[]) => void;
  checklistItems: ChecklistItem[];
  saveChecklistItems: (items: ChecklistItem[]) => void;
  addLine: (line: Line) => void;
  updateLineDisplayPeriod: (lineId: string, displayFrom?: string, displayTo?: string) => void;
  removeLine: (lineId: string) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, ScheduleEntry>>(initialEntries);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialChecklistItems);
  const [lines, setLines] = useState<Line[]>(initialLines);

  const value = useMemo<ScheduleContextValue>(
    () => ({
      lines,
      entries,
      upsertEntry: (dateKey, lineIds) => {
        setEntries((prev) => ({ ...prev, [dateKey]: { dateKey, lineIds } }));
      },
      checklistItems,
      saveChecklistItems: setChecklistItems,
      addLine: (line) => {
        setLines((prev) => [...prev, line]);
      },
      updateLineDisplayPeriod: (lineId, displayFrom, displayTo) => {
        setLines((prev) =>
          prev.map((line) => (line.id === lineId ? { ...line, displayFrom, displayTo } : line))
        );
      },
      removeLine: (lineId) => {
        setLines((prev) => prev.filter((line) => line.id !== lineId));
      },
    }),
    [entries, checklistItems, lines]
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function ScheduleProviderOutlet() {
  return (
    <ScheduleProvider>
      <Outlet />
    </ScheduleProvider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
