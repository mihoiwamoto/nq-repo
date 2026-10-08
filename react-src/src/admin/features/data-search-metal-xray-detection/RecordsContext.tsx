import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { MachineSearchRecord } from "./types";
import type { ApprovalStatus } from "../../data/approvals";
import { machineSearchRecords } from "./mockRecords";
import { CURRENT_ACCOUNT } from "../account/mockData";
import { useFactoryList } from "../../data/factoryDemo";
import { commentTimestamp } from "../../utils/recordTimestamps";

type RecordsContextValue = {
  records: MachineSearchRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, comment: string) => void;
  deleteRecord: (id: string) => void;
  updateInspectionRecord: (recordId: string, inspectionId: string, cause: string, response: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useFactoryList<MachineSearchRecord>("metal-xray-detection", machineSearchRecords, "records");

  const value = useMemo<RecordsContextValue>(
    () => ({
      records,
      setApprovalStatus: (id, status) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: status } : r)));
      },
      addComment: (id, text) => {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  comments: [
                    ...(r.comments ?? []),
                    {
                      id: `${id}-${Date.now()}`,
                      author: CURRENT_ACCOUNT.name,
                      timestamp: commentTimestamp(),
                      text,
                    },
                  ],
                }
              : r
          )
        );
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
