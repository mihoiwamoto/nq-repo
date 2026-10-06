import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet, useParams } from "react-router-dom";
import type { ChecklistItem, Line, ScheduleEntry } from "./types";
import { factoryData, type FactoryScheduleData } from "./mockData";
import { useDemoEmpty } from "../../../components/demo/demoStore";

type ScheduleContextValue = {
  lines: Line[];
  entries: Record<string, ScheduleEntry>;
  upsertEntry: (dateKey: string, lineIds: string[]) => void;
  checklistItems: ChecklistItem[];
  saveChecklistItems: (items: ChecklistItem[]) => void;
  addLine: (line: Line) => void;
  updateLineDisplayPeriod: (lineId: string, displayFrom?: string, displayTo?: string) => void;
  removeLine: (lineId: string) => void;
};

/**
 * 工場ごとのデータを持つ（キーは :factoryId）。初めて開いた工場は mockData の見本から始める。
 * Provider は :factoryId より上のルートに置いてあるので、どの工場かは useSchedule() が useParams で決める。
 */
type Store = {
  get: (factoryId: string) => FactoryScheduleData;
  update: (factoryId: string, fn: (prev: FactoryScheduleData) => FactoryScheduleData) => void;
};

const ScheduleContext = createContext<Store | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [byFactory, setByFactory] = useState<Record<string, FactoryScheduleData>>({});

  const get = useCallback((factoryId: string) => byFactory[factoryId] ?? factoryData(factoryId), [byFactory]);
  const update = useCallback<Store["update"]>((factoryId, fn) => {
    setByFactory((prev) => ({ ...prev, [factoryId]: fn(prev[factoryId] ?? factoryData(factoryId)) }));
  }, []);
  const value = useMemo(() => ({ get, update }), [get, update]);

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function ScheduleProviderOutlet() {
  return (
    <ScheduleProvider>
      <Outlet />
    </ScheduleProvider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const store = useContext(ScheduleContext);
  if (!store) throw new Error("useSchedule must be used within ScheduleProvider");
  const { factoryId = "f1" } = useParams<{ factoryId: string }>();
  const { get, update } = store;
  // 右下の「状態を試す › データが無い」のときは、持ち場/ライン・点検予定・確認項目を無いものとして見せる
  const empty = useDemoEmpty();
  const stored = get(factoryId);
  const data = useMemo(
    () => (empty ? { ...stored, lines: [], entries: {}, checklistItems: [] } : stored),
    [empty, stored],
  );

  return useMemo<ScheduleContextValue>(
    () => ({
      lines: data.lines,
      entries: data.entries,
      upsertEntry: (dateKey, lineIds) => {
        update(factoryId, (d) => ({ ...d, entries: { ...d.entries, [dateKey]: { dateKey, lineIds } } }));
      },
      checklistItems: data.checklistItems,
      saveChecklistItems: (items) => {
        update(factoryId, (d) => ({ ...d, checklistItems: items }));
      },
      addLine: (line) => {
        update(factoryId, (d) => ({ ...d, lines: [...d.lines, line] }));
      },
      updateLineDisplayPeriod: (lineId, displayFrom, displayTo) => {
        update(factoryId, (d) => ({
          ...d,
          lines: d.lines.map((line) => (line.id === lineId ? { ...line, displayFrom, displayTo } : line)),
        }));
      },
      removeLine: (lineId) => {
        update(factoryId, (d) => ({ ...d, lines: d.lines.filter((line) => line.id !== lineId) }));
      },
    }),
    [data, factoryId, update],
  );
}
