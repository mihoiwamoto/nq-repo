import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useDemoInspectionState } from "../../../components/demo/demoStore";
import { Outlet } from "react-router-dom";
import {
  points as initialPoints,
  recordsByPoint as initialRecordsByPoint,
  type PointStatus,
  type WaterInspectionRecord,
  type WaterPoint,
} from "./mockData";

type WaterInspectionContextValue = {
  points: WaterPoint[];
  updatePointStatus: (pointId: string, status: PointStatus) => void;
  recordsByPoint: Record<string, WaterInspectionRecord[]>;
  updateRecord: (pointId: string, record: WaterInspectionRecord) => void;
  addRecord: (pointId: string, record: Omit<WaterInspectionRecord, "id">) => WaterInspectionRecord;
};

const WaterInspectionContext = createContext<WaterInspectionContextValue | null>(null);

export function WaterInspectionProvider({ children }: { children: ReactNode }) {
  // 動作デモ「データが無い」のときは、まだ 1 件も点検していない状態から始める
  const [points, setPoints] = useDemoInspectionState<WaterPoint>(initialPoints);
  const [recordsByPoint, setRecordsByPoint] = useState(initialRecordsByPoint);

  const value = useMemo<WaterInspectionContextValue>(
    () => ({
      points,
      updatePointStatus: (pointId, status) => {
        setPoints((prev) => prev.map((point) => (point.id === pointId ? { ...point, status } : point)));
      },
      recordsByPoint,
      updateRecord: (pointId, record) => {
        setRecordsByPoint((prev) => ({
          ...prev,
          [pointId]: (prev[pointId] ?? []).map((r) => (r.id === record.id ? record : r)),
        }));
      },
      addRecord: (pointId, record) => {
        const created: WaterInspectionRecord = { id: `${pointId}-r${Date.now()}`, ...record };
        setRecordsByPoint((prev) => ({
          ...prev,
          [pointId]: [created, ...(prev[pointId] ?? [])],
        }));
        setPoints((prev) =>
          prev.map((point) => (point.id === pointId ? { ...point, status: "inspected" } : point))
        );
        return created;
      },
    }),
    [points, recordsByPoint]
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
