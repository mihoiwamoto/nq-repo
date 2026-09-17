import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useDemoInspectionState } from "../../../components/demo/demoStore";
import { Outlet } from "react-router-dom";
import {
  chemicals as initialChemicals,
  initialRecords,
  type Chemical,
  type ChemicalRecord,
  type ChemicalStatus,
} from "./mockData";

type NewChemicalRecordInput = Omit<ChemicalRecord, "id">;

type ChemicalManagementContextValue = {
  chemicals: Chemical[];
  updateChemicalStatus: (chemicalId: string, status: ChemicalStatus) => void;
  records: ChemicalRecord[];
  addRecord: (input: NewChemicalRecordInput) => void;
  updateRecord: (recordId: string, input: NewChemicalRecordInput) => void;
};

const ChemicalManagementContext = createContext<ChemicalManagementContextValue | null>(null);

export function ChemicalManagementProvider({ children }: { children: ReactNode }) {
  // 動作デモ「データが無い」のときは、まだ 1 件も点検していない状態から始める
  const [chemicals, setChemicals] = useDemoInspectionState<Chemical>(initialChemicals);
  const [records, setRecords] = useState<ChemicalRecord[]>(initialRecords);

  const value = useMemo<ChemicalManagementContextValue>(
    () => ({
      chemicals,
      updateChemicalStatus: (chemicalId, status) => {
        setChemicals((prev) =>
          prev.map((chemical) =>
            chemical.id === chemicalId ? { ...chemical, status } : chemical
          )
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
    [chemicals, records]
  );

  return (
    <ChemicalManagementContext.Provider value={value}>{children}</ChemicalManagementContext.Provider>
  );
}

export function ChemicalManagementProviderOutlet() {
  return (
    <ChemicalManagementProvider>
      <Outlet />
    </ChemicalManagementProvider>
  );
}

export function useChemicalManagement() {
  const ctx = useContext(ChemicalManagementContext);
  if (!ctx) throw new Error("useChemicalManagement must be used within ChemicalManagementProvider");
  return ctx;
}
