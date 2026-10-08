import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useDemoInspectionState } from "../../../components/demo/demoStore";
import { Outlet } from "react-router-dom";
import {
  points as initialPoints,
  recordsByPoint as initialRecordsByPoint,
  type PointStatus,
  type WaterInspectionRecord,
  type WaterPoint,
} from "./mockData";
import { useFactoryKeyed } from "../../data/factoryAppData";

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
  // 工場ごとの見本（プロトタイプの「ログイン中」）。記録の場所はその工場の点検場所の名前にする
  const [recordsByPoint, setRecordsByPoint] = useFactoryKeyed(initialRecordsByPoint, initialPoints, (recs, point, factory) =>
    factory === "f1" && !point.id.includes("~") ? recs : recs.map((r) => ({ ...r, location: point.name }))
  );

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
