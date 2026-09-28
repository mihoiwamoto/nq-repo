import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ADDITIVES, type Additive } from "../../../data/additives";

type NewAdditiveInput = {
  name: string;
  spec: string;
  unit: string;
  storageLocation: string;
};

type AdditiveManagementContextValue = {
  additives: Additive[];
  addAdditive: (input: NewAdditiveInput) => void;
  updateAdditive: (id: string, input: NewAdditiveInput) => void;
  removeAdditive: (id: string) => void;
};

const AdditiveManagementContext = createContext<AdditiveManagementContextValue | null>(null);

export function AdditiveManagementProvider({ children }: { children: ReactNode }) {
  const [additives, setAdditives] = useState<Additive[]>(ADDITIVES);

  const value = useMemo<AdditiveManagementContextValue>(
    () => ({
      additives,
      addAdditive: (input) => {
        setAdditives((prev) => [
          ...prev,
          { id: `a${Date.now()}`, ...input },
        ]);
      },
      updateAdditive: (id, input) => {
        setAdditives((prev) =>
          prev.map((additive) => (additive.id === id ? { ...additive, ...input } : additive))
        );
      },
      removeAdditive: (id) => {
        setAdditives((prev) => prev.filter((additive) => additive.id !== id));
      },
    }),
    [additives]
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
