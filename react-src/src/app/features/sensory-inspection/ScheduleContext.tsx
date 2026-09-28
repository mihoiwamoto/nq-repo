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

export function SensoryScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, SensoryScheduleEntry>>(
    initialSensoryScheduleEntries
  );

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
