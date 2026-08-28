import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { INITIAL_NQ_PRODUCTS } from "./mockData";
import type { NqProduct } from "./types";

type NqProductInput = Omit<NqProduct, "id">;

type ProductManagementContextValue = {
  nqProducts: NqProduct[];
  addNqProduct: (input: NqProductInput) => NqProduct;
  updateNqProduct: (id: string, input: NqProductInput) => void;
  removeNqProduct: (id: string) => void;
};

const ProductManagementContext = createContext<ProductManagementContextValue | null>(null);

export function ProductManagementProvider({ children }: { children: ReactNode }) {
  const [nqProducts, setNqProducts] = useState<NqProduct[]>(INITIAL_NQ_PRODUCTS);

  const value = useMemo<ProductManagementContextValue>(
    () => ({
      nqProducts,
      addNqProduct: (input) => {
        const created: NqProduct = { id: `nq${Date.now()}`, ...input };
        setNqProducts((prev) => [...prev, created]);
        return created;
      },
      updateNqProduct: (id, input) => {
        setNqProducts((prev) =>
          prev.map((product) => (product.id === id ? { ...product, ...input } : product))
        );
      },
      removeNqProduct: (id) => {
        setNqProducts((prev) => prev.filter((product) => product.id !== id));
      },
    }),
    [nqProducts]
  );

  return (
    <ProductManagementContext.Provider value={value}>{children}</ProductManagementContext.Provider>
  );
}

export function ProductManagementProviderOutlet() {
  return (
    <ProductManagementProvider>
      <Outlet />
    </ProductManagementProvider>
  );
}

export function useProductManagement() {
  const ctx = useContext(ProductManagementContext);
  if (!ctx) throw new Error("useProductManagement must be used within ProductManagementProvider");
  return ctx;
}
