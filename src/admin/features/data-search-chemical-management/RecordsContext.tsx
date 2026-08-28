import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { ChemicalRecord } from "./types";
import type { ApprovalStatus } from "../../data/approvals";
import { chemicalRecords } from "./mockRecords";

type RecordsContextValue = {
  records: ChemicalRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, comment: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ChemicalRecord[]>(chemicalRecords);

  const value = useMemo<RecordsContextValue>(
    () => ({
      records,
      setApprovalStatus: (id, status) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: status } : r)));
      },
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
