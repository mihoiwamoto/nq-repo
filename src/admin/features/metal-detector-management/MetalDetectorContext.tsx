import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { METAL_DETECTOR_UNITS } from "./mockData";
import type { MetalDetectorUnit, TestPieceSetting } from "./types";

type MetalDetectorContextValue = {
  units: MetalDetectorUnit[];
  addUnit: (unit: { name: string; settings: TestPieceSetting[] }) => void;
  updateUnit: (id: string, unit: { name: string; settings: TestPieceSetting[] }) => void;
  removeUnit: (id: string) => void;
  moveUnit: (id: string, direction: "up" | "down") => void;
};

const MetalDetectorContext = createContext<MetalDetectorContextValue | null>(null);

export function MetalDetectorProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<MetalDetectorUnit[]>(METAL_DETECTOR_UNITS);

  function addUnit(unit: { name: string; settings: TestPieceSetting[] }) {
    setUnits((prev) => [...prev, { id: `u${Date.now()}`, ...unit }]);
  }

  function updateUnit(id: string, unit: { name: string; settings: TestPieceSetting[] }) {
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
    <MetalDetectorContext.Provider value={{ units, addUnit, updateUnit, removeUnit, moveUnit }}>
      {children}
    </MetalDetectorContext.Provider>
  );
}

export function MetalDetectorProviderOutlet() {
  return (
    <MetalDetectorProvider>
      <Outlet />
    </MetalDetectorProvider>
  );
}

export function useMetalDetector() {
  const ctx = useContext(MetalDetectorContext);
  if (!ctx) throw new Error("useMetalDetector must be used within MetalDetectorProvider");
  return ctx;
}
