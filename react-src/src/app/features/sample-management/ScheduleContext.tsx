import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import {
  SAMPLE_TARGET_PRODUCTS,
  type SampleTargetProduct,
} from "../../../admin/features/sample-management/mockData";

/**
 * アプリの点検予定 › 検体管理 検体製品設定 の見本と状態（2026-10-08。本番 iOS の CalendarMainLogic.allowedReportIds に合わせて足した）。
 * 官能検査記録の点検予定（sensory-inspection/ScheduleContext）と同じ作り。
 *
 * - 選べる製品は管理画面の検体の管理 › 検体対象製品の見本（SAMPLE_TARGET_PRODUCTS。読むだけ）
 * - 製品ごとに 製造日・ロットNo. を持つ（確定デザイン 6198:79025）。追加したときは見本の値を入れておく
 */
export type ScheduledSample = {
  productId: string;
  manufactureDate: string;
  lotNumber: string;
};

export type SampleScheduleEntry = {
  dateKey: string;
  products: ScheduledSample[];
};

export function scheduledSampleFrom(product: SampleTargetProduct): ScheduledSample {
  return {
    productId: product.id,
    manufactureDate: product.manufactureDate ?? "",
    lotNumber: product.lotNumber ?? "",
  };
}

/** 確定デザイン（6198:78826・6198:78680）：4/1 に 3 製品 */
const initialEntries: Record<string, SampleScheduleEntry> = {
  "2025-04-01": {
    dateKey: "2025-04-01",
    products: SAMPLE_TARGET_PRODUCTS.slice(0, 3).map(scheduledSampleFrom),
  },
};

type SampleScheduleContextValue = {
  products: SampleTargetProduct[];
  entries: Record<string, SampleScheduleEntry>;
  upsertEntry: (dateKey: string, products: ScheduledSample[]) => void;
  removeEntry: (dateKey: string) => void;
};

const SampleScheduleContext = createContext<SampleScheduleContextValue | null>(null);

export function SampleScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, SampleScheduleEntry>>(initialEntries);

  const value = useMemo<SampleScheduleContextValue>(
    () => ({
      products: SAMPLE_TARGET_PRODUCTS,
      entries,
      upsertEntry: (dateKey, products) => {
        setEntries((prev) => ({ ...prev, [dateKey]: { dateKey, products } }));
      },
      removeEntry: (dateKey) => {
        setEntries((prev) => {
          const next = { ...prev };
          delete next[dateKey];
          return next;
        });
      },
    }),
    [entries]
  );

  return <SampleScheduleContext.Provider value={value}>{children}</SampleScheduleContext.Provider>;
}

export function SampleScheduleProviderOutlet() {
  return (
    <SampleScheduleProvider>
      <Outlet />
    </SampleScheduleProvider>
  );
}

export function useSampleSchedule() {
  const ctx = useContext(SampleScheduleContext);
  if (!ctx) throw new Error("useSampleSchedule must be used within SampleScheduleProvider");
  // 右下の「状態を試す › データが無い」のときは、製品も予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, products: [], entries: {} } : ctx), [ctx, empty]);
}
