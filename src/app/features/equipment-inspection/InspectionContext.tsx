import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  initialScheduleEntries,
  lines as initialLines,
  type Line,
  type LineStatus,
  type ScheduleEntry,
} from "./mockData";

type InspectionContextValue = {
  lines: Line[];
  updateLineStatus: (lineId: string, status: LineStatus) => void;
  entries: Record<string, ScheduleEntry>;
  upsertEntry: (dateKey: string, lineIds: string[]) => void;
  removeEntry: (dateKey: string) => void;
};

const InspectionContext = createContext<InspectionContextValue | null>(null);

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [entries, setEntries] = useState<Record<string, ScheduleEntry>>(initialScheduleEntries);

  const value = useMemo<InspectionContextValue>(
    () => ({
      lines,
      updateLineStatus: (lineId, status) => {
        setLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, status } : line)));
      },
      entries,
      upsertEntry: (dateKey, lineIds) => {
        setEntries((prev) => ({ ...prev, [dateKey]: { dateKey, lineIds } }));
      },
      removeEntry: (dateKey) => {
        setEntries((prev) => {
          const next = { ...prev };
          delete next[dateKey];
          return next;
        });
      },
    }),
    [lines, entries]
  );

  return <InspectionContext.Provider value={value}>{children}</InspectionContext.Provider>;
}

export function InspectionProviderOutlet() {
  return (
    <InspectionProvider>
      <Outlet />
    </InspectionProvider>
  );
}

export function useInspection() {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error("useInspection must be used within InspectionProvider");
  return ctx;
}
