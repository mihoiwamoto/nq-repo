import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SENSORY_TARGET_PRODUCTS } from "./mockData";
import type { ScheduleEntry, SensoryTargetProduct } from "./types";

type SensoryInspectionContextValue = {
  products: SensoryTargetProduct[];
  addProduct: (product: Omit<SensoryTargetProduct, "id">) => void;
  updateProduct: (id: string, product: Omit<SensoryTargetProduct, "id">) => void;
  removeProduct: (id: string) => void;
  scheduleEntries: Record<string, ScheduleEntry>;
  upsertScheduleEntry: (dateKey: string, productIds: string[]) => void;
  removeScheduleEntry: (dateKey: string) => void;
};

const SensoryInspectionContext = createContext<SensoryInspectionContextValue | null>(null);

export function SensoryInspectionProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<SensoryTargetProduct[]>(SENSORY_TARGET_PRODUCTS);
  const [scheduleEntries, setScheduleEntries] = useState<Record<string, ScheduleEntry>>({});

  function addProduct(product: Omit<SensoryTargetProduct, "id">) {
    setProducts((prev) => [...prev, { id: `stp${Date.now()}`, ...product }]);
  }

  function updateProduct(id: string, product: Omit<SensoryTargetProduct, "id">) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { id, ...product } : p)));
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
    <SensoryInspectionContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        removeProduct,
        scheduleEntries,
        upsertScheduleEntry,
        removeScheduleEntry,
      }}
    >
      {children}
    </SensoryInspectionContext.Provider>
  );
}

export function SensoryInspectionProviderOutlet() {
  return (
    <SensoryInspectionProvider>
      <Outlet />
    </SensoryInspectionProvider>
  );
}

export function useSensoryInspection() {
  const ctx = useContext(SensoryInspectionContext);
  if (!ctx) throw new Error("useSensoryInspection must be used within SensoryInspectionProvider");
  return ctx;
}
