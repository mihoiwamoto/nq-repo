import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { AdditiveRecord } from "./types";
import type { ApprovalStatus } from "../../data/approvals";
import { additiveRecords } from "./mockRecords";
import { CURRENT_ACCOUNT } from "../account/mockData";
import { useFactoryList } from "../../data/factoryDemo";
import { commentTimestamp } from "../../utils/recordTimestamps";

type RecordsContextValue = {
  records: AdditiveRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, text: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useFactoryList<AdditiveRecord>("additive-management", additiveRecords, "records");

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
