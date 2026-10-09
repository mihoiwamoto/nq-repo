import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  initialSensoryScheduleEntries,
  type ScheduledProduct,
  type SensoryScheduleEntry,
} from "./mockData";

type SensoryScheduleContextValue = {
  entries: Record<string, SensoryScheduleEntry>;
  upsertEntry: (dateKey: string, products: ScheduledProduct[]) => void;
  removeEntry: (dateKey: string) => void;
};

const SensoryScheduleContext = createContext<SensoryScheduleContextValue | null>(null);

/** 点検予定で登録した内容を、帳票一覧の官能検査記録（記録入力）でも読めるよう、画面をまたいで持つ（2026-10-09） */
let savedEntries: Record<string, SensoryScheduleEntry> = initialSensoryScheduleEntries;

export function SensoryScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntriesState] = useState<Record<string, SensoryScheduleEntry>>(() => savedEntries);
  const setEntries = (
    update: (prev: Record<string, SensoryScheduleEntry>) => Record<string, SensoryScheduleEntry>
  ) =>
    setEntriesState((prev) => {
      savedEntries = update(prev);
      return savedEntries;
    });

  const value = useMemo<SensoryScheduleContextValue>(
    () => ({
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

  return <SensoryScheduleContext.Provider value={value}>{children}</SensoryScheduleContext.Provider>;
}

export function SensoryScheduleProviderOutlet() {
  return (
    <SensoryScheduleProvider>
      <Outlet />
    </SensoryScheduleProvider>
  );
}

export function useSensorySchedule() {
  const ctx = useContext(SensoryScheduleContext);
  if (!ctx) throw new Error("useSensorySchedule must be used within SensoryScheduleProvider");
  return ctx;
}
