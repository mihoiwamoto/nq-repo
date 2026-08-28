import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { initialWaterInspectionPoints } from "./mockData";
import type { WaterInspectionPoint } from "./types";

type WaterInspectionPointInput = Omit<WaterInspectionPoint, "id">;

type WaterInspectionContextValue = {
  points: WaterInspectionPoint[];
  addPoint: (input: WaterInspectionPointInput) => WaterInspectionPoint;
  updatePoint: (id: string, input: WaterInspectionPointInput) => void;
  removePoint: (id: string) => void;
};

const WaterInspectionContext = createContext<WaterInspectionContextValue | null>(null);

export function WaterInspectionProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState<WaterInspectionPoint[]>(initialWaterInspectionPoints);

  const value = useMemo<WaterInspectionContextValue>(
    () => ({
      points,
      addPoint: (input) => {
        const created: WaterInspectionPoint = { id: `wp${Date.now()}`, ...input };
        setPoints((prev) => [...prev, created]);
        return created;
      },
      updatePoint: (id, input) => {
        setPoints((prev) => prev.map((point) => (point.id === id ? { id, ...input } : point)));
      },
      removePoint: (id) => {
        setPoints((prev) => prev.filter((point) => point.id !== id));
      },
    }),
    [points]
  );

  return <WaterInspectionContext.Provider value={value}>{children}</WaterInspectionContext.Provider>;
}

export function WaterInspectionProviderOutlet() {
  return (
    <WaterInspectionProvider>
      <Outlet />
    </WaterInspectionProvider>
  );
}

export function useWaterInspection() {
  const ctx = useContext(WaterInspectionContext);
  if (!ctx) throw new Error("useWaterInspection must be used within WaterInspectionProvider");
  return ctx;
}
