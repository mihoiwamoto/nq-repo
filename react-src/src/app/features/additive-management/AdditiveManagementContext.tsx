import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useDemoInspectionState } from "../../../components/demo/demoStore";
import { Outlet } from "react-router-dom";
import {
  additives as initialAdditives,
  initialRecords,
  type Additive,
  type AdditiveRecord,
  type AdditiveStatus,
} from "./mockData";
import { useFactoryRecords } from "../../data/factoryAppData";

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
  // 動作デモ「データが無い」のときは、まだ 1 件も点検していない状態から始める
  const [additives, setAdditives] = useDemoInspectionState<Additive>(initialAdditives);
  // 工場ごとの見本（プロトタイプの「ログイン中」）。増やした添加物には元の添加物の記録を写す
  const [records, setRecords] = useFactoryRecords<AdditiveRecord, Additive>(initialRecords, initialAdditives, "additiveId");

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
