import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  additives as initialAdditives,
  initialRecords,
  type Additive,
  type AdditiveRecord,
  type AdditiveStatus,
} from "./mockData";

type NewAdditiveRecordInput = Omit<AdditiveRecord, "id">;

type AdditiveManagementContextValue = {
  additives: Additive[];
  updateAdditiveStatus: (additiveId: string, status: AdditiveStatus) => void;
  records: AdditiveRecord[];
  addRecord: (input: NewAdditiveRecordInput) => void;
  updateRecord: (recordId: string, input: NewAdditiveRecordInput) => void;
};

const AdditiveManagementContext = createContext<AdditiveManagementContextValue | null>(null);

export function AdditiveManagementProvider({ children }: { children: ReactNode }) {
  const [additives, setAdditives] = useState<Additive[]>(initialAdditives);
  const [records, setRecords] = useState<AdditiveRecord[]>(initialRecords);

  const value = useMemo<AdditiveManagementContextValue>(
    () => ({
      additives,
      updateAdditiveStatus: (additiveId, status) => {
        setAdditives((prev) =>
          prev.map((additive) => (additive.id === additiveId ? { ...additive, status } : additive))
        );
      },
      records,
      addRecord: (input) => {
        setRecords((prev) => [...prev, { id: `r${Date.now()}`, ...input }]);
      },
      updateRecord: (recordId, input) => {
        setRecords((prev) =>
          prev.map((record) => (record.id === recordId ? { id: recordId, ...input } : record))
        );
      },
    }),
    [additives, records]
  );

  return (
    <AdditiveManagementContext.Provider value={value}>{children}</AdditiveManagementContext.Provider>
  );
}

export function AdditiveManagementProviderOutlet() {
  return (
    <AdditiveManagementProvider>
      <Outlet />
    </AdditiveManagementProvider>
  );
}

export function useAdditiveManagement() {
  const ctx = useContext(AdditiveManagementContext);
  if (!ctx) throw new Error("useAdditiveManagement must be used within AdditiveManagementProvider");
  return ctx;
}
