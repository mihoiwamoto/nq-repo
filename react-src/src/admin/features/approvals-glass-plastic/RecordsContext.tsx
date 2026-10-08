import { createContext, useContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { glassPlasticApprovalRecords } from "./mockData";
import type { GlassPlasticApprovalRecord } from "./types";
import type { ApprovalStatus } from "../../data/approvals";
import { CURRENT_ACCOUNT } from "../account/mockData";
import { useFactoryList } from "../../data/factoryDemo";
import { commentTimestamp } from "../../utils/recordTimestamps";

type RecordsContextValue = {
  records: GlassPlasticApprovalRecord[];
  setApprovalStatus: (id: string, status: ApprovalStatus) => void;
  addComment: (id: string, comment: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useFactoryList<GlassPlasticApprovalRecord>("glass-plastic", glassPlasticApprovalRecords, "approval");

  function setApprovalStatus(id: string, status: ApprovalStatus) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: status } : r)));
  }

  function addComment(id: string, text: string) {
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
