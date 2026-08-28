import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { additiveApprovalRecords } from "./mockData";
import type { AdditiveApprovalRecord } from "./types";
import type { ApprovalStatus } from "../../data/approvals";

type RecordsContextValue = {
  records: AdditiveApprovalRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, comment: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AdditiveApprovalRecord[]>(additiveApprovalRecords);

  function setApprovalStatus(id: string, status: ApprovalStatus) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: status } : r)));
  }

  function addComment(id: string, comment: string) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, comment } : r)));
  }

  return (
    <RecordsContext.Provider value={{ records, setApprovalStatus, addComment }}>
      {children}
    </RecordsContext.Provider>
  );
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
