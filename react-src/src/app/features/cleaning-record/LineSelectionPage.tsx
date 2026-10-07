import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useCleaningRecord } from "./CleaningRecordContext";
import { LineProgressButton, LineProgressPanel } from "./LineProgressPanel";
import { ACTORS, FREQUENCY_LABELS, LINE_STATUS_COLORS, LINE_STATUS_LABELS, type Frequency, type Line } from "./mockData";
import { formatMonthDay } from "../../utils/date";
import { StatusChip } from "../../components/StatusChip";

const FREQUENCY_TABS: { key: Frequency; label: string }[] = [
  { key: "daily", label: FREQUENCY_LABELS.daily },
  { key: "weekly", label: FREQUENCY_LABELS.weekly },
  { key: "monthly", label: FREQUENCY_LABELS.monthly },
  { key: "yearly", label: FREQUENCY_LABELS.yearly },
];

/**
 * 持ち場/ライン選択画面。
 * nextDay = 翌日（04/02）の状態。毎週は、当日（04/01）に見送ったときの「明日に見送る」で出方が変わる。
 * はい → そのラインが 04/02 に「未点検」で並ぶ。いいえ・見送っていない → 清掃自体がなくなるので、毎週の清掃予定は残らない。
 */
export function LineSelectionPage({ nextDay = false }: { nextDay?: boolean } = {}) {
  const { lines: allLines } = useCleaningRecord();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const [frequency, setFrequency] = useState<Frequency>(nextDay ? "weekly" : "daily");
  const [progressOpen, setProgressOpen] = useState(false);

  const lines = nextDay ? nextDayLines(allLines) : allLines;
  const visibleLines = lines.filter((line) => line.frequency === frequency);
  const inspectedCount = visibleLines.filter(
    (line) => line.status === "inspected" || line.status === "confirmed"
  ).length;
  const inspectedLines = lines.filter((line) => line.status === "inspected");

  // 毎週は「清掃予定」で登録した日付ごとに見出しを付けて表示する。
  // 先週分を清掃しないまま今週になった場合は、先週分・今週分の日付が両方並ぶ。
  const groupByDate = frequency === "weekly";
  const dateGroups = useMemo(() => {
    const groups = new Map<string, Line[]>();
    visibleLines.forEach((line) => {
      const key = line.scheduledDate ?? "";
      const group = groups.get(key);
      if (group) group.push(line);
      else groups.set(key, [line]);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visibleLines]);

  function renderLine(line: Line) {
    return (
      <Link
        key={line.id}
        to={`/app/ledger-list/cleaning-record/lines/${line.id}`}
        state={{ inspectorName }}
        className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full"
      >
        <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{line.name}</p>
        <StatusChip color={LINE_STATUS_COLORS[line.status]}>{LINE_STATUS_LABELS[line.status]}</StatusChip>
      </Link>
    );
  }

  return (
    <>
      <AppHeader
        title="清掃記録"
        action={
          <LineProgressButton
            inspectedCount={inspectedCount}
            total={visibleLines.length}
            onClick={() => setProgressOpen(true)}
          />
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="bg-white flex h-10 items-center rounded-lg w-full max-w-full">
          {FREQUENCY_TABS.map((tab) => {
            const count = lines.filter(
              (line) =>
                line.frequency === tab.key &&
                (line.status === "not_inspected" || line.status === "in_progress")
            ).length;
            const active = tab.key === frequency;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFrequency(tab.key)}
                className={`relative flex-1 h-10 rounded-lg text-lg ${
                  active ? "bg-[var(--semantic-brand-primary)] text-white" : "text-[var(--semantic-text-secondary)]"
                }`}
              >
                {tab.label}
                {!active && (
                  <span className="absolute -top-1.5 right-4 bg-[var(--semantic-brand-danger)] text-white text-[8px] leading-none tabular-nums rounded-full size-4 flex items-center justify-center">
                    {String(count).padStart(2, "0")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-6 items-start w-full max-w-full">
          {visibleLines.length === 0 ? (
            <div className="bg-white flex h-[200px] items-center justify-center py-10 rounded-lg w-full">
              <p className="text-xl leading-none text-center text-[var(--semantic-text-primary)]">
                点検予定が登録されていません
              </p>
            </div>
          ) : groupByDate ? (
            dateGroups.map(([dateKey, groupLines]) => (
              <div key={dateKey} className="flex flex-col gap-2 items-start w-full">
                {dateKey && (
                  <div className="border-b border-[#d0d0d0] flex items-center py-4 w-full">
                    <p className="text-xl leading-none text-[var(--semantic-text-primary)]">
                      {formatMonthDay(dateKey)}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-6 items-start w-full">
                  {groupLines.map(renderLine)}
                </div>
              </div>
            ))
          ) : (
            visibleLines.map(renderLine)
          )}
        </div>

        {/* 上の余白は親の gap(24px) + mt-4 = 40px */}
        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center mt-4 px-4 py-6 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>

      {progressOpen && <LineProgressPanel lines={lines} inspectedLines={inspectedLines} onClose={() => setProgressOpen(false)} />}
    </>
  );
}

/** 翌日（当日の 1 日後）の毎週の並び。「明日に見送る：はい」で見送ったものだけが、翌日の日付で未点検に戻って並ぶ */
function nextDayLines(lines: Line[]): Line[] {
  return lines.flatMap((line) => {
    if (line.frequency !== "weekly") return [line];
    if (line.status !== "skipped" || line.deferToTomorrow !== true) return [];
    return [{ ...line, status: "not_inspected" as const, scheduledDate: addDay(line.scheduledDate), inspectorName: undefined, inspectionDate: undefined }];
  });
}

function addDay(dateKey?: string): string | undefined {
  if (!dateKey) return dateKey;
  const [y, m, d] = dateKey.split("-").map(Number);
  const next = new Date(y, m - 1, d + 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}
