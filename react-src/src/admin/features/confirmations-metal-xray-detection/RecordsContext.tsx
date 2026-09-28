import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { CURRENT_ACCOUNT } from "../account/mockData";
import { machineConfirmationRecords } from "./mockData";
import type { MachineConfirmationRecord } from "./types";

type RecordsContextValue = {
  records: MachineConfirmationRecord[];
  addComment: (id: string, text: string) => void;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MachineConfirmationRecord[]>(machineConfirmationRecords);

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
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " ").replaceAll("-", "."),
                  text,
                },
              ],
            }
          : r
      )
    );
  }

  return (
    <RecordsContext.Provider value={{ records, addComment }}>
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
