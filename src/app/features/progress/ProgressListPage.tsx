import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import iconXMarkGreen from "../../../assets/figma/icons/common/cancel-green.svg";
import iconSearch from "@images/Icon/search.svg";
import { AppHeader } from "../../layout/AppHeader";
import { ledgerCategories } from "../../../data/ledgers";
import { StatusChip } from "../../components/StatusChip";
import {
  ACTORS,
  PROGRESS_ENTRIES,
  PROGRESS_STATUS_COLORS,
  PROGRESS_STATUS_LABELS,
  type ProgressEntry,
} from "./mockData";

const FILTER_LEDGERS = ledgerCategories;

function ledgerFor(slug: string) {
  return ledgerCategories.find((c) => c.slug === slug);
}

function groupByDate(entries: ProgressEntry[]) {
  const map = new Map<string, ProgressEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.date) ?? [];
    list.push(entry);
    map.set(entry.date, list);
  }
  return Array.from(map.entries());
}

function groupByLedger(entries: ProgressEntry[]) {
  const map = new Map<string, ProgressEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.ledgerSlug) ?? [];
    list.push(entry);
    map.set(entry.ledgerSlug, list);
  }
  return Array.from(map.entries());
}

function destinationPathFor(entry: ProgressEntry) {
  const base = "/app/ledger-list";
  switch (entry.ledgerSlug) {
    case "equipment-inspection":
      return entry.lineId ? `${base}/equipment-inspection/lines/${entry.lineId}` : null;
    case "water-inspection":
      return entry.pointId ? `${base}/water-inspection/points/${entry.pointId}/new` : null;
    case "glass-plastic":
      return entry.floorId ? `${base}/glass-plastic/floors/${entry.floorId}` : null;
    case "cleaning-record":
      return entry.lineId ? `${base}/cleaning-record/lines/${entry.lineId}` : null;
    case "chemical-management":
      return entry.productId ? `${base}/chemical-management/${entry.productId}` : null;
    case "additive-management":
      return entry.productId ? `${base}/additive-management/products/${entry.productId}` : null;
    case "scale-inspection":
      return entry.postId ? `${base}/scale-inspection/posts/${entry.postId}` : null;
    case "sample-management":
      return entry.productId ? `${base}/sample-management/samples/${entry.productId}` : null;
    case "sensory-inspection":
      return entry.productId ? `${base}/sensory-inspection/products/${entry.productId}` : null;
    case "metal-xray-detection":
      return entry.machineId ? `${base}/metal-xray-detection/machines/${entry.machineId}` : null;
    default:
      return null;
  }
}

function StatusBadge({ entry }: { entry: ProgressEntry }) {
  return (
    <StatusChip color={PROGRESS_STATUS_COLORS[entry.status]}>{PROGRESS_STATUS_LABELS[entry.status]}</StatusChip>
  );
}

export function ProgressListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "not_inspected">("all");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [appliedFilters, setAppliedFilters] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const keys = new Set<string>();
    groupByDate(PROGRESS_ENTRIES).forEach(([date, entries]) => {
      groupByLedger(entries).forEach(([slug]) => {
        keys.add(`${date}|${slug}`);
      });
    });
    return keys;
  });
  const [actorPickerEntry, setActorPickerEntry] = useState<ProgressEntry | null>(null);
  const [selectedActorId, setSelectedActorId] = useState(ACTORS[0].id);
  const [unsupportedNotice, setUnsupportedNotice] = useState(false);

  const notInspectedCount = PROGRESS_ENTRIES.filter((e) => e.status === "not_inspected").length;

  const filtered = useMemo(() => {
    return PROGRESS_ENTRIES.filter((entry) => {
      if (appliedFilters.size > 0 && !appliedFilters.has(entry.ledgerSlug)) return false;
      if (tab === "not_inspected" && entry.status !== "not_inspected") return false;
      return true;
    });
  }, [tab, appliedFilters]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  function openFilterDialog() {
    setPickerSelected(new Set(appliedFilters));
    setFilterDialogOpen(true);
  }

  function toggleFilterLedger(slug: string) {
    setPickerSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function applyFilters() {
    setAppliedFilters(new Set(pickerSelected));
    setFilterDialogOpen(false);
  }

  function removeFilter(slug: string) {
    setAppliedFilters((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }

  function toggleGroupExpanded(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleEntryClick(entry: ProgressEntry) {
    setActorPickerEntry(entry);
    setSelectedActorId(ACTORS[0].id);
  }

  function closeActorPicker() {
    setActorPickerEntry(null);
  }

  function confirmActorPicker() {
    if (!actorPickerEntry) return;
    const actor = ACTORS.find((a) => a.id === selectedActorId) ?? ACTORS[0];
    const entry = actorPickerEntry;
    setActorPickerEntry(null);
    const path = destinationPathFor(entry);
    if (!path) {
      setUnsupportedNotice(true);
      return;
    }
    // progressStatus を渡すことで、遷移先が「未点検=記録なし / 点検中=記録途中 /
    // 点検済み・確認完了=点検済みの記録」を進捗一覧と揃えて表示できる
    navigate(path, {
      state: { inspectorName: actor.name, fromProgress: true, progressStatus: entry.status },
    });
  }

  return (
    <>
      <AppHeader title="進捗一覧" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        <div className="bg-white flex items-center rounded-lg w-full">
          {(["all", "not_inspected"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative flex-1 h-10 rounded-lg text-lg ${
                tab === key
                  ? "bg-[var(--semantic-brand-primary)] text-white"
                  : "text-[var(--semantic-text-secondary)]"
              }`}
            >
              {key === "all" ? "すべて" : "未点検"}
              {key === "not_inspected" && (
                <span className="absolute -top-2 left-[60%] h-5 min-w-[20px] px-1 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[10px] flex items-center justify-center">
                  {String(notInspectedCount).padStart(2, "0")}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openFilterDialog}
          className="bg-white flex gap-2 items-center justify-center p-4 rounded-lg shrink-0 text-lg text-[var(--semantic-brand-primary)]"
        >
          絞り込み検索
          <img src={iconSearch} alt="検索" className="size-5" style={{ filter: "invert(24%) sepia(78%) saturate(2186%) hue-rotate(86deg)" }} />
        </button>

        {appliedFilters.size > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-base text-[var(--semantic-text-secondary)] shrink-0">絞り込み条件</span>
            {Array.from(appliedFilters).map((slug) => {
              const ledger = ledgerFor(slug);
              if (!ledger) return null;
              return (
                <span
                  key={slug}
                  className="bg-white border border-[#d0d0d0] h-10 rounded-lg flex items-center gap-2 px-3"
                >
                  <img src={ledger.appIcon} alt="" className="size-5 shrink-0" />
                  <span className="text-base text-[var(--semantic-text-primary)]">{ledger.appLabel}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(slug)}
                    className="text-[var(--semantic-brand-primary)] text-sm"
                  >
                    <img src={iconXMarkGreen} alt="削除" className="size-4" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {grouped.length === 0 ? (
          <p className="text-lg text-[var(--semantic-text-secondary)] text-center py-6">
            該当する点検はありません
          </p>
        ) : (
          grouped.map(([date, entries]) => (
            <div key={date} className="flex flex-col gap-4 items-start w-full">
              <p className="text-2xl text-[var(--semantic-text-primary)] border-b border-[#d0d0d0] w-full py-4">
                {date}
              </p>

              {tab === "all"
                ? groupByLedger(entries).map(([slug, groupEntries]) => {
                    const ledger = ledgerFor(slug);
                    const groupKey = `${date}|${slug}`;
                    const collapsed = !expandedGroups.has(groupKey);
                    const confirmedCount = groupEntries.filter((e) => e.status === "confirmed").length;
                    const pct = Math.round((confirmedCount / groupEntries.length) * 100);
                    return (
                      <div key={slug} className="flex flex-col gap-0 items-start w-full">
                        <div className="flex w-full justify-end">
                          <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-end gap-2 pl-6 pr-3 py-2 rounded-t-lg w-fit max-w-full">
                            <span className="text-white text-lg shrink-0">確認完了</span>
                            <div className="bg-white h-3 rounded-full overflow-hidden w-[88px] shrink-0">
                              <div
                                className="bg-[var(--semantic-brand-primary)] h-full border border-white rounded-lg"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-white text-xl font-semibold shrink-0">
                              {confirmedCount}/{groupEntries.length}
                            </span>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between w-full gap-2 bg-white px-4 py-3 ${collapsed ? "rounded-tl-lg rounded-bl-lg rounded-br-lg" : "rounded-tl-lg"}`}>
                          <span className="flex items-center gap-2 text-xl text-[var(--semantic-brand-primary)] font-semibold">
                            {ledger && <img src={ledger.appIcon} alt="" className="size-6 shrink-0" />}
                            {ledger?.appLabel ?? slug}
                            {slug === "metal-xray-detection" && (
                              <span className="text-base text-[var(--semantic-text-secondary)] ml-2">金属探知機1号機</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleGroupExpanded(groupKey)}
                            className="text-[var(--semantic-brand-primary)] font-bold text-xl w-6 h-6 flex items-center justify-center shrink-0"
                          >
                            {collapsed ? "+" : "−"}
                          </button>
                        </div>
                        {!collapsed && (
                          <div className="flex flex-col gap-0 items-start w-full bg-white rounded-b-lg overflow-hidden">
                            {groupEntries.map((entry, idx) => (
                              <div key={entry.id} className="w-full">
                                <button
                                  type="button"
                                  onClick={() => handleEntryClick(entry)}
                                  className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50"
                                >
                                  <span className="text-lg text-[var(--semantic-text-primary)]">
                                    {entry.name}
                                  </span>
                                  <StatusBadge entry={entry} />
                                </button>
                                {idx !== groupEntries.length - 1 && (
                                  <div className="border-b border-[#d0d0d0] mx-4" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                : entries.map((entry) => {
                    const ledger = ledgerFor(entry.ledgerSlug);
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleEntryClick(entry)}
                        className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex items-center justify-between p-4 w-full text-left"
                      >
                        <span className="flex flex-col gap-2 min-w-0">
                          <span className="text-xl text-[var(--semantic-text-primary)]">{entry.name}</span>
                          <span className="flex gap-1 items-center">
                            {ledger && <img src={ledger.appIcon} alt="" className="size-5 shrink-0" />}
                            <span className="text-base text-[var(--semantic-brand-primary)]">
                              {ledger?.appLabel ?? entry.ledgerSlug}
                            </span>
                          </span>
                        </span>
                        <StatusBadge entry={entry} />
                      </button>
                    );
                  })}
            </div>
          ))
        )}
      </div>

      {filterDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[754px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">絞り込み条件</h2>
            <div className="grid grid-cols-3 gap-6 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
              {FILTER_LEDGERS.map((ledger) => {
                const selected = pickerSelected.has(ledger.slug);
                return (
                  <button
                    key={ledger.slug}
                    type="button"
                    onClick={() => toggleFilterLedger(ledger.slug)}
                    className={`flex flex-col items-center justify-center gap-2 h-28 rounded-lg shadow-[0px_2px_3px_rgba(51,51,51,0.24)] border-2 ${
                      selected
                        ? "bg-white border-[var(--semantic-brand-primary)]"
                        : "bg-white border-transparent"
                    }`}
                  >
                    <img src={ledger.appIcon} alt="" className="size-10" />
                    <span className="text-base text-[var(--semantic-text-primary)] text-center px-1">
                      {ledger.appLabel}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setFilterDialogOpen(false)}
                className="bg-white border-2 border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-lg text-[var(--semantic-text-primary)] font-semibold"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-lg text-white font-semibold"
              >
                絞り込み
              </button>
            </div>
          </div>
        </div>
      )}

      {actorPickerEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeActorPicker} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">実施者を選んでください</h2>
            <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
              {ACTORS.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => setSelectedActorId(actor.id)}
                  className={`h-[78px] rounded-lg flex flex-col items-center justify-start pt-2 gap-0 p-4 shadow-[0px_2px_3px_rgba(51,51,51,0.24)] ${
                    selectedActorId === actor.id
                      ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                      : "bg-white border-2 border-transparent"
                  }`}
                >
                  <span className="text-base text-[var(--semantic-text-primary)]">{actor.name}</span>
                  <span className="text-sm text-[var(--semantic-text-secondary)]">{actor.id}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeActorPicker}
                className="bg-white border-2 border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-lg text-[var(--semantic-text-primary)] font-semibold"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={confirmActorPicker}
                className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-lg text-white font-semibold"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      )}

      {unsupportedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setUnsupportedNotice(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-8 w-[480px] max-w-[90vw]">
            <p className="text-lg text-[var(--semantic-text-primary)] text-center">
              この帳票の点検機能は未対応です。
            </p>
            <button
              type="button"
              onClick={() => setUnsupportedNotice(false)}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
