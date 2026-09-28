import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { WEIGHT_CHECKER_UNITS } from "./mockData";
import type { WeightCheckerUnit } from "./types";

type WeightCheckerContextValue = {
  units: WeightCheckerUnit[];
  addUnit: (unit: { name: string }) => void;
  updateUnit: (id: string, unit: { name: string }) => void;
  removeUnit: (id: string) => void;
  moveUnit: (id: string, direction: "up" | "down") => void;
};

const WeightCheckerContext = createContext<WeightCheckerContextValue | null>(null);

export function WeightCheckerProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<WeightCheckerUnit[]>(WEIGHT_CHECKER_UNITS);

  function addUnit(unit: { name: string }) {
    setUnits((prev) => [...prev, { id: `wu${Date.now()}`, ...unit }]);
  }

  function updateUnit(id: string, unit: { name: string }) {
    setUnits((prev) => prev.map((u) => (u.id === id ? { id, ...unit } : u)));
  }

  function removeUnit(id: string) {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  function moveUnit(id: string, direction: "up" | "down") {
    setUnits((prev) => {
      const index = prev.findIndex((u) => u.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  return (
    <WeightCheckerContext.Provider value={{ units, addUnit, updateUnit, removeUnit, moveUnit }}>
      {children}
    </WeightCheckerContext.Provider>
  );
}

export function WeightCheckerProviderOutlet() {
  return (
    <WeightCheckerProvider>
      <Outlet />
    </WeightCheckerProvider>
  );
}

export function useWeightChecker() {
  const ctx = useContext(WeightCheckerContext);
  if (!ctx) throw new Error("useWeightChecker must be used within WeightCheckerProvider");
  return ctx;
}
