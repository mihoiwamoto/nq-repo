import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { initialEntries, initialLines } from "./mockData";
import type { Line, ScheduleEntry } from "./types";

type CleaningRecordContextValue = {
  lines: Line[];
  entries: Record<string, ScheduleEntry>;
  upsertEntry: (dateKey: string, lineIds: string[]) => void;
  addLine: (line: Line) => void;
  updateLineDisplayPeriod: (lineId: string, displayFrom?: string, displayTo?: string) => void;
  removeLine: (lineId: string) => void;
};

const CleaningRecordContext = createContext<CleaningRecordContextValue | null>(null);

export function CleaningRecordProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [entries, setEntries] = useState<Record<string, ScheduleEntry>>(initialEntries);

  const value = useMemo<CleaningRecordContextValue>(
    () => ({
      lines,
      entries,
      upsertEntry: (dateKey, lineIds) => {
        setEntries((prev) => ({ ...prev, [dateKey]: { dateKey, lineIds } }));
      },
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
    [lines, entries]
  );

  return <CleaningRecordContext.Provider value={value}>{children}</CleaningRecordContext.Provider>;
}

export function CleaningRecordProviderOutlet() {
  return (
    <CleaningRecordProvider>
      <Outlet />
    </CleaningRecordProvider>
  );
}

export function useCleaningRecord() {
  const ctx = useContext(CleaningRecordContext);
  if (!ctx) throw new Error("useCleaningRecord must be used within CleaningRecordProvider");
  return ctx;
}
