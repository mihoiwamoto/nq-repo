import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import { floors as initialFloors } from "./mockData";
import type { Floor, RepairStatus } from "./types";
import { useFactoryList } from "../../data/factoryDemo";

type GlassPlasticContextValue = {
  floors: Floor[];
  addFloor: (floor: Floor) => void;
  updateFloor: (floorId: string, updates: { name: string; displayFrom?: string; displayTo?: string }) => void;
  removeFloor: (floorId: string) => void;
  updateRepairStatus: (floorId: string, repairItemId: string, status: RepairStatus) => void;
};

const GlassPlasticContext = createContext<GlassPlasticContextValue | null>(null);

export function GlassPlasticProvider({ children }: { children: ReactNode }) {
  const [floors, setFloors] = useFactoryList<Floor>("glass-plastic", initialFloors, "registry");

  const value = useMemo<GlassPlasticContextValue>(
    () => ({
      floors,
      addFloor: (floor) => setFloors((prev) => [...prev, floor]),
      updateFloor: (floorId, updates) => {
        setFloors((prev) => prev.map((f) => (f.id === floorId ? { ...f, ...updates } : f)));
      },
      removeFloor: (floorId) => setFloors((prev) => prev.filter((f) => f.id !== floorId)),
      updateRepairStatus: (floorId, repairItemId, status) => {
        setFloors((prev) =>
          prev.map((f) =>
            f.id !== floorId
              ? f
              : {
                  ...f,
                  repairItems: f.repairItems.map((item) =>
                    item.id === repairItemId ? { ...item, status } : item
                  ),
                }
          )
        );
      },
    }),
    [floors]
  );

  return <GlassPlasticContext.Provider value={value}>{children}</GlassPlasticContext.Provider>;
}

export function GlassPlasticProviderOutlet() {
  return (
    <GlassPlasticProvider>
      <Outlet />
    </GlassPlasticProvider>
  );
}

export function useGlassPlastic() {
  const ctx = useContext(GlassPlasticContext);
  if (!ctx) throw new Error("useGlassPlastic must be used within GlassPlasticProvider");
  // 右下の「状態を試す › データが無い」のときは、登録物も予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, floors: [] } : ctx), [ctx, empty]);
}
