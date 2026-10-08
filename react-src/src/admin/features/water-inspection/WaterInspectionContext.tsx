import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import { initialWaterInspectionPoints } from "./mockData";
import type { WaterInspectionPoint } from "./types";
import { useFactoryList } from "../../data/factoryDemo";

type WaterInspectionPointInput = Omit<WaterInspectionPoint, "id">;

type WaterInspectionContextValue = {
  points: WaterInspectionPoint[];
  addPoint: (input: WaterInspectionPointInput) => WaterInspectionPoint;
  updatePoint: (id: string, input: WaterInspectionPointInput) => void;
  removePoint: (id: string) => void;
};

const WaterInspectionContext = createContext<WaterInspectionContextValue | null>(null);

export function WaterInspectionProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useFactoryList<WaterInspectionPoint>("water-inspection", initialWaterInspectionPoints, "registry");

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
  // 右下の「状態を試す › データが無い」のときは、登録物も予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, points: [] } : ctx), [ctx, empty]);
}
