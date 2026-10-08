import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import { SAMPLE_TARGET_PRODUCTS, type SampleTargetProduct } from "./mockData";
import type { ScheduleEntry, ScheduleProductDetail } from "./types";
import { useFactoryList } from "../../data/factoryDemo";

type SampleManagementContextValue = {
  products: SampleTargetProduct[];
  addProduct: (name: string) => void;
  removeProduct: (id: string) => void;
  scheduleEntries: Record<string, ScheduleEntry>;
  upsertScheduleEntry: (dateKey: string, productIds: string[], details?: Record<string, ScheduleProductDetail>) => void;
  removeScheduleEntry: (dateKey: string) => void;
};

const SampleManagementContext = createContext<SampleManagementContextValue | null>(null);

export function SampleManagementProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useFactoryList<SampleTargetProduct>("sample-management", SAMPLE_TARGET_PRODUCTS, "registry");
  const [scheduleEntries, setScheduleEntries] = useState<Record<string, ScheduleEntry>>({});

  function addProduct(name: string) {
    setProducts((prev) => [...prev, { id: `sp${Date.now()}`, name }]);
  }

  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  function upsertScheduleEntry(dateKey: string, productIds: string[], details?: Record<string, ScheduleProductDetail>) {
    setScheduleEntries((prev) => ({ ...prev, [dateKey]: { dateKey, productIds, details } }));
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
  // 右下の「状態を試す › データが無い」のときは、登録物も予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, products: [], scheduleEntries: {} } : ctx), [ctx, empty]);
}
