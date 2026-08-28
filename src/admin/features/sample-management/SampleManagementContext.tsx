import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SAMPLE_TARGET_PRODUCTS, type SampleTargetProduct } from "./mockData";
import type { ScheduleEntry } from "./types";

type SampleManagementContextValue = {
  products: SampleTargetProduct[];
  addProduct: (name: string) => void;
  removeProduct: (id: string) => void;
  scheduleEntries: Record<string, ScheduleEntry>;
  upsertScheduleEntry: (dateKey: string, productIds: string[]) => void;
  removeScheduleEntry: (dateKey: string) => void;
};

const SampleManagementContext = createContext<SampleManagementContextValue | null>(null);

export function SampleManagementProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<SampleTargetProduct[]>(SAMPLE_TARGET_PRODUCTS);
  const [scheduleEntries, setScheduleEntries] = useState<Record<string, ScheduleEntry>>({});

  function addProduct(name: string) {
    setProducts((prev) => [...prev, { id: `sp${Date.now()}`, name }]);
  }

  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  function upsertScheduleEntry(dateKey: string, productIds: string[]) {
    setScheduleEntries((prev) => ({ ...prev, [dateKey]: { dateKey, productIds } }));
  }

  function removeScheduleEntry(dateKey: string) {
    setScheduleEntries((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  }

  return (
    <SampleManagementContext.Provider
      value={{
        products,
        addProduct,
        removeProduct,
        scheduleEntries,
        upsertScheduleEntry,
        removeScheduleEntry,
      }}
    >
      {children}
    </SampleManagementContext.Provider>
  );
}

export function SampleManagementProviderOutlet() {
  return (
    <SampleManagementProvider>
      <Outlet />
    </SampleManagementProvider>
  );
}

export function useSampleManagement() {
  const ctx = useContext(SampleManagementContext);
  if (!ctx) throw new Error("useSampleManagement must be used within SampleManagementProvider");
  return ctx;
}
