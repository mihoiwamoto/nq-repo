import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import { lines as ledgerLines, type Line } from "./mockData";

/**
 * アプリの点検予定（清掃記録 持ち場/ライン設定）の見本と状態。機械器具点検の InspectionContext の点検予定の部分に倣う。
 *
 * - 選べる持ち場/ラインは、帳票一覧の清掃記録と同じ見本（mockData の lines）のうち毎日以外。
 *   毎日のラインは毎日出るので予定に入れない（ポップアップのタブも 毎週・毎月・毎年 だけ）。
 * - 最初から入っている予定は、帳票一覧の毎週のラインに付けた実施予定日（scheduledDate）から作る。
 *   帳票一覧の毎週のタブに並ぶラインと、点検予定のその日の中身が食い違わないようにするため。
 */
export type CleaningScheduleEntry = {
  dateKey: string;
  lineIds: string[];
};

const scheduleLines: Line[] = ledgerLines.filter((line) => line.frequency !== "daily");

function initialEntries(): Record<string, CleaningScheduleEntry> {
  const entries: Record<string, CleaningScheduleEntry> = {};
  for (const line of scheduleLines) {
    if (!line.scheduledDate) continue;
    const entry = (entries[line.scheduledDate] ??= { dateKey: line.scheduledDate, lineIds: [] });
    entry.lineIds.push(line.id);
  }
  return entries;
}

type CleaningScheduleContextValue = {
  lines: Line[];
  entries: Record<string, CleaningScheduleEntry>;
  upsertEntry: (dateKey: string, lineIds: string[]) => void;
  removeEntry: (dateKey: string) => void;
};

const CleaningScheduleContext = createContext<CleaningScheduleContextValue | null>(null);

export function CleaningScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, CleaningScheduleEntry>>(initialEntries);

  const value = useMemo<CleaningScheduleContextValue>(
    () => ({
      lines: scheduleLines,
      entries,
      upsertEntry: (dateKey, lineIds) => {
        setEntries((prev) => ({ ...prev, [dateKey]: { dateKey, lineIds } }));
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

  return <CleaningScheduleContext.Provider value={value}>{children}</CleaningScheduleContext.Provider>;
}

export function CleaningScheduleProviderOutlet() {
  return (
    <CleaningScheduleProvider>
      <Outlet />
    </CleaningScheduleProvider>
  );
}

export function useCleaningSchedule() {
  const ctx = useContext(CleaningScheduleContext);
  if (!ctx) throw new Error("useCleaningSchedule must be used within CleaningScheduleProvider");
  // 右下の「状態を試す › データが無い」のときは、持ち場/ラインも予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, lines: [], entries: {} } : ctx), [ctx, empty]);
}
