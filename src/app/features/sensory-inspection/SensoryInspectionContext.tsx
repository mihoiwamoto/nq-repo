import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  products as initialProducts,
  recordsByProduct as initialRecordsByProduct,
  type Product,
  type SensoryRecord,
} from "./mockData";

type SensoryInspectionContextValue = {
  products: Product[];
  recordsByProduct: Record<string, SensoryRecord | null>;
  submitRecord: (productId: string, record: SensoryRecord, inspectorName: string) => void;
};

const SensoryInspectionContext = createContext<SensoryInspectionContextValue | null>(null);

export function SensoryInspectionProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [recordsByProduct, setRecordsByProduct] = useState<Record<string, SensoryRecord | null>>(
    initialRecordsByProduct
  );

  const value = useMemo<SensoryInspectionContextValue>(
    () => ({
      products,
      recordsByProduct,
      submitRecord: (productId, record, inspectorName) => {
        setRecordsByProduct((prev) => ({ ...prev, [productId]: record }));
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? { ...product, status: "inspected", date: record.date, inspectorName }
              : product
          )
        );
      },
    }),
    [products, recordsByProduct]
  );

  return <SensoryInspectionContext.Provider value={value}>{children}</SensoryInspectionContext.Provider>;
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
