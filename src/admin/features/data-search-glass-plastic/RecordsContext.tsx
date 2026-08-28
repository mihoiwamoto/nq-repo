import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { GlassPlasticRecord } from "./types";
import { glassPlasticRecords } from "./mockRecords";

type RecordsContextValue = {
  records: GlassPlasticRecord[];
  addComment: (id: string, comment: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records] = useState<GlassPlasticRecord[]>(glassPlasticRecords);

  const value = useMemo<RecordsContextValue>(
    () => ({
      records,
      addComment: (id, comment) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, comment } : r)));
      },
    }),
    [records]
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function RecordsProviderOutlet() {
  return (
    <RecordsProvider>
      <Outlet />
    </RecordsProvider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error("useRecords must be used within RecordsProvider");
  return ctx;
}
