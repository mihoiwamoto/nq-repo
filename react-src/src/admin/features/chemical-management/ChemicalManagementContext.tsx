import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import { CHEMICALS, type Chemical } from "../../../data/chemicals";
import { useFactoryList } from "../../data/factoryDemo";

type ChemicalInput = {
  name: string;
  spec: string;
  unit: string;
  storageLocation: string;
};

type ChemicalManagementContextValue = {
  chemicals: Chemical[];
  addChemical: (input: ChemicalInput) => void;
  updateChemical: (id: string, input: ChemicalInput) => void;
  removeChemical: (id: string) => void;
};

const ChemicalManagementContext = createContext<ChemicalManagementContextValue | null>(null);

export function ChemicalManagementProvider({ children }: { children: ReactNode }) {
  const [chemicals, setChemicals] = useFactoryList<Chemical>("chemical-management", CHEMICALS, "registry");

  const value = useMemo<ChemicalManagementContextValue>(
    () => ({
      chemicals,
      addChemical: (input) => {
        setChemicals((prev) => [...prev, { id: `c${Date.now()}`, ...input }]);
      },
      updateChemical: (id, input) => {
        setChemicals((prev) =>
          prev.map((chemical) => (chemical.id === id ? { ...chemical, ...input } : chemical))
        );
      },
      removeChemical: (id) => {
        setChemicals((prev) => prev.filter((chemical) => chemical.id !== id));
      },
    }),
    [chemicals]
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
  // 右下の「状態を試す › データが無い」のときは、登録物も予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, chemicals: [] } : ctx), [ctx, empty]);
}
