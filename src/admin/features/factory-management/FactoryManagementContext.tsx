import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { INITIAL_FACTORY_RECORDS } from "./mockData";
import type { FactoryRecord, FactoryRecordInput } from "./types";

type FactoryManagementContextValue = {
  factories: FactoryRecord[];
  addFactory: (input: FactoryRecordInput) => FactoryRecord;
  updateFactory: (id: string, input: FactoryRecordInput) => void;
  removeFactory: (id: string) => void;
};

const FactoryManagementContext = createContext<FactoryManagementContextValue | null>(null);

export function FactoryManagementProvider({ children }: { children: ReactNode }) {
  const [factories, setFactories] = useState<FactoryRecord[]>(INITIAL_FACTORY_RECORDS);

  const value = useMemo<FactoryManagementContextValue>(
    () => ({
      factories,
      addFactory: (input) => {
        const { password, ...rest } = input;
        const created: FactoryRecord = { id: `f${Date.now()}`, hasPassword: Boolean(password), ...rest };
        setFactories((prev) => [...prev, created]);
        return created;
      },
      updateFactory: (id, input) => {
        const { password, ...rest } = input;
        setFactories((prev) =>
          prev.map((factory) =>
            factory.id === id
              ? { ...factory, ...rest, hasPassword: factory.hasPassword || Boolean(password) }
              : factory
          )
        );
      },
      removeFactory: (id) => {
        setFactories((prev) => prev.filter((factory) => factory.id !== id));
      },
    }),
    [factories]
  );

  return (
    <FactoryManagementContext.Provider value={value}>{children}</FactoryManagementContext.Provider>
  );
}

export function FactoryManagementProviderOutlet() {
  return (
    <FactoryManagementProvider>
      <Outlet />
    </FactoryManagementProvider>
  );
}

export function useFactoryManagement() {
  const ctx = useContext(FactoryManagementContext);
  if (!ctx) throw new Error("useFactoryManagement must be used within FactoryManagementProvider");
  return ctx;
}
