import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useDemoInspectionState } from "../../../components/demo/demoStore";
import { Outlet } from "react-router-dom";
import { floors as initialFloors, type Floor, type FloorStatus, type RoomItemRecord } from "./mockData";

type GlassPlasticContextValue = {
  floors: Floor[];
  updateFloorStatus: (floorId: string, status: FloorStatus) => void;
  currentFloorRecords: Record<string, RoomItemRecord> | null;
  setCurrentFloorRecords: (records: Record<string, RoomItemRecord> | null) => void;
};

const GlassPlasticContext = createContext<GlassPlasticContextValue | null>(null);

export function GlassPlasticProvider({ children }: { children: ReactNode }) {
  // 動作デモ「データが無い」のときは、まだ 1 件も点検していない状態から始める
  const [floors, setFloors] = useDemoInspectionState<Floor>(initialFloors);
  const [currentFloorRecords, setCurrentFloorRecords] = useState<Record<string, RoomItemRecord> | null>(null);

  const value = useMemo<GlassPlasticContextValue>(
    () => ({
      floors,
      updateFloorStatus: (floorId, status) => {
        setFloors((prev) => prev.map((floor) => (floor.id === floorId ? { ...floor, status } : floor)));
      },
      currentFloorRecords,
      setCurrentFloorRecords,
    }),
    [floors, currentFloorRecords]
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
  return ctx;
}
