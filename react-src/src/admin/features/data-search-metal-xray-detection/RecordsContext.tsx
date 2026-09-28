import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { MachineSearchRecord } from "./types";
import type { ApprovalStatus } from "../../data/approvals";
import { machineSearchRecords } from "./mockRecords";

type RecordsContextValue = {
  records: MachineSearchRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, comment: string) => void;
  deleteRecord: (id: string) => void;
  updateInspectionRecord: (recordId: string, inspectionId: string, cause: string, response: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MachineSearchRecord[]>(machineSearchRecords);

  const value = useMemo<RecordsContextValue>(
    () => ({
      records,
      setApprovalStatus: (id, status) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: status } : r)));
      },
      addComment: (id, comment) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, comment } : r)));
      },
      deleteRecord: (id) => {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      },
      updateInspectionRecord: (recordId, inspectionId, cause, response) => {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  records: r.records.map((insp) =>
                    insp.id === inspectionId ? { ...insp, cause, response } : insp
                  ),
                }
              : r
          )
        );
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
