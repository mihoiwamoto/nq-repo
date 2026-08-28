import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { XRAY_DETECTOR_UNITS } from "./mockData";
import type { XrayDetectorUnit, XrayTestPieceSetting } from "./types";

type XrayDetectorContextValue = {
  units: XrayDetectorUnit[];
  addUnit: (unit: { name: string; settings: XrayTestPieceSetting[] }) => void;
  updateUnit: (id: string, unit: { name: string; settings: XrayTestPieceSetting[] }) => void;
  removeUnit: (id: string) => void;
  moveUnit: (id: string, direction: "up" | "down") => void;
};

const XrayDetectorContext = createContext<XrayDetectorContextValue | null>(null);

export function XrayDetectorProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<XrayDetectorUnit[]>(XRAY_DETECTOR_UNITS);

  function addUnit(unit: { name: string; settings: XrayTestPieceSetting[] }) {
    setUnits((prev) => [...prev, { id: `xu${Date.now()}`, ...unit }]);
  }

  function updateUnit(id: string, unit: { name: string; settings: XrayTestPieceSetting[] }) {
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
    <XrayDetectorContext.Provider value={{ units, addUnit, updateUnit, removeUnit, moveUnit }}>
      {children}
    </XrayDetectorContext.Provider>
  );
}

export function XrayDetectorProviderOutlet() {
  return (
    <XrayDetectorProvider>
      <Outlet />
    </XrayDetectorProvider>
  );
}

export function useXrayDetector() {
  const ctx = useContext(XrayDetectorContext);
  if (!ctx) throw new Error("useXrayDetector must be used within XrayDetectorProvider");
  return ctx;
}
