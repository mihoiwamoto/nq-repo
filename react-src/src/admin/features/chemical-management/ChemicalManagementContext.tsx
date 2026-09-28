import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { CHEMICALS, type Chemical } from "../../../data/chemicals";

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
  const [chemicals, setChemicals] = useState<Chemical[]>(CHEMICALS);

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
  return ctx;
}
