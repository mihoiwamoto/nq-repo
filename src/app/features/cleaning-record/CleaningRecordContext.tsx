import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { lines as initialLines, type Line, type LineStatus } from "./mockData";

type CleaningRecordContextValue = {
  lines: Line[];
  updateLineStatus: (lineId: string, status: LineStatus) => void;
};

const CleaningRecordContext = createContext<CleaningRecordContextValue | null>(null);

export function CleaningRecordProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(initialLines);

  const value = useMemo<CleaningRecordContextValue>(
    () => ({
      lines,
      updateLineStatus: (lineId, status) => {
        setLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, status } : line)));
      },
    }),
    [lines]
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
