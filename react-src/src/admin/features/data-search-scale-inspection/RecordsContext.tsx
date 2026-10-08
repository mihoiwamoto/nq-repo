import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { ApprovalStatus } from "../../data/approvals";
import type { RepairStatus, ScaleRecord } from "./types";
import { scaleRecords } from "./mockRecords";
import { CURRENT_ACCOUNT } from "../account/mockData";
import { useFactoryList } from "../../data/factoryDemo";

type RecordsContextValue = {
  records: ScaleRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  setRepairStatus: (id: string, status: RepairStatus) => void;
  addComment: (id: string, comment: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useFactoryList<ScaleRecord>("scale-inspection", scaleRecords, "records");

  const value = useMemo<RecordsContextValue>(
    () => ({
      records,
      setApprovalStatus: (id, status) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: status } : r)));
      },
      setRepairStatus: (id, status) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, repairStatus: status } : r)));
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
                      timestamp: new Date().toISOString().slice(0, 16).replace("T", " ").replaceAll("-", "."),
                      text,
                    },
                  ],
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
