import { ACTORS as CLEANING_ACTORS } from "../cleaning-record/mockData";
import { SAMPLE_REVIEW_DETAILS, type SampleConfirmState } from "../sample-management/mockData";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import iconXMarkGreen from "../../../assets/figma/icons/common/cancel-green.svg";
import iconUnsent from "../../../assets/figma/icons/common/unsent.svg";
import iconSearch from "@images/Icon/search.svg";
import { AppHeader } from "../../layout/AppHeader";
import { ledgerCategories } from "../../../data/ledgers";
import { visibleLedgerCategories } from "../../../data/ledgerVisibility";
import { StatusChip } from "../../components/StatusChip";
import { useDemoList } from "../../../components/demo/demoStore";
import { useAnnouncementBar } from "../../layout/AnnouncementBarContext";
import iconPlusMask from "../../../assets/figma/icons/common/plus.svg";
import iconMinusMask from "../../../assets/figma/icons/common/minus.svg";
import {
  ACTORS,
  PROGRESS_ENTRIES,
  PROGRESS_STATUS_COLORS,
  PROGRESS_STATUS_LABELS,
  type ProgressEntry,
} from "./mockData";
import { AppEmptyState } from "../../components/AppEmptyState";

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

/**
 * 実施者を選ばずに、見るだけの詳細へ直接進む行（本番 iOS の進捗一覧：case .detector / .specimen は
 * 未点検・点検中・差し戻しだけ presentImplementerSelection、それ以外は detectorProgressDetail /
 * specimenResultDetail を直接開く。2026-10-08）。進捗一覧に差し戻しのステータスは無いので、点検済み・確認完了が対象
 */
function directDetailFor(entry: ProgressEntry): { path: string; state: unknown } | null {
  if (entry.status !== "inspected" && entry.status !== "confirmed") return null;
  const base = "/app/ledger-list";
  if (entry.ledgerSlug === "metal-xray-detection" && entry.machineId) {
    // 機器の記録の一覧（読むだけ）。確認完了は「編集」も出さない
    return {
      path: `${base}/metal-xray-detection/machines/${entry.machineId}/review`,
      state: { locked: entry.status === "confirmed", fromProgress: true, progressStatus: entry.status },
    };
  }
  if (entry.ledgerSlug === "sample-management" && entry.productId) {
    // 結果の詳細（読むだけ）。提出前の確認画面を、注意書きと「提出」を外して使う
    const detail = SAMPLE_REVIEW_DETAILS[entry.productId] ?? Object.values(SAMPLE_REVIEW_DETAILS)[0];
    const stampFields = ["manufactureDate", "sampleType", "quantity", "unit", "storageLocation"];
    const state: SampleConfirmState & { fromProgress: boolean; progressStatus: ProgressEntry["status"]; progressView: boolean } = {
      inspectorName: detail.inspectorName,
      inspectionDate: detail.inspectionDate,
      manufactureDate: detail.manufactureDate,
      sampleType: detail.sampleType,
      quantity: detail.quantity,
      unit: detail.unit,
      storageLocation: detail.storageLocation,
      remarks: detail.remarks,
      timestamps: Object.fromEntries(stampFields.map((f) => [f, detail.timestamp])),
      fromProgress: true,
      progressStatus: entry.status,
      progressView: true,
    };
    return { path: `${base}/sample-management/samples/${entry.productId}/confirm`, state };
  }
  return null;
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

/**
 * 未送信マークの ↖ アイコン。注意書き（14px・黒）と行（24px・グレー）で
 * 色も大きさも違うので、1 枚の SVG をマスクにして色と大きさだけ変えて使う。
 */
function UnsentIcon({ size, color }: { size: number; color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 align-middle"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url("${iconUnsent}")`,
        maskImage: `url("${iconUnsent}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        backgroundColor: color,
      }}
    />
  );
}

function StatusBadge({ entry, unsent }: { entry: ProgressEntry; unsent: boolean }) {
  return (
    <span className="flex items-center gap-2 shrink-0">
      {unsent && <UnsentIcon size={24} color="var(--semantic-text-secondary)" />}
      <StatusChip color={PROGRESS_STATUS_COLORS[entry.status]}>{PROGRESS_STATUS_LABELS[entry.status]}</StatusChip>
    </span>
  );
}

export function ProgressListPage() {
  const navigate = useNavigate();
  // 上に「未送信のデータがあります」の帯が出ている間だけ、未送信マークを出す
  const { hasUnsent } = useAnnouncementBar();
  // 動作デモの「データが無い」を試している間は、進捗そのものが 1 件も無い状態にする
  const entries = useDemoList(PROGRESS_ENTRIES);
  const [tab, setTab] = useState<"all" | "not_inspected">("all");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [appliedFilters, setAppliedFilters] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const keys = new Set<string>();
    groupByDate(PROGRESS_ENTRIES).forEach(([date, dateEntries]) => {
      groupByLedger(dateEntries).forEach(([slug]) => {
        keys.add(`${date}|${slug}`);
      });
    });
    return keys;
  });
  const [actorPickerEntry, setActorPickerEntry] = useState<ProgressEntry | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [unsupportedNotice, setUnsupportedNotice] = useState(false);

  const notInspectedCount = entries.filter((e) => e.status === "not_inspected").length;

  /**
   * その行が未送信かどうか。
   * 未送信になりうるのは「点検して提出したが、まだ送れていない」記録なので、
   * 点検済み（＝提出済み・確認前）の行だけにマークを出す。
   */
  function isUnsent(entry: ProgressEntry) {
    return hasUnsent && entry.status === "inspected";
  }

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (appliedFilters.size > 0 && !appliedFilters.has(entry.ledgerSlug)) return false;
      if (tab === "not_inspected" && entry.status !== "not_inspected") return false;
      return true;
    });
  }, [entries, tab, appliedFilters]);

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
    const direct = directDetailFor(entry);
    if (direct) {
      navigate(direct.path, { state: direct.state });
      return;
    }
    setActorPickerEntry(entry);
    // 確定デザイン（7139:293786）どおり、開いた時点では誰も選ばない（選ぶまで「次へ」は押せない）
    setSelectedActorId(null);
  }

  function closeActorPicker() {
    setActorPickerEntry(null);
  }

  // 実施者の選択に並ぶ人は帳票ごとに違う。清掃記録は帳票一覧と同じ 9 人（確定デザイン 7139:229334）
  const pickerActors = actorPickerEntry?.ledgerSlug === "cleaning-record" ? CLEANING_ACTORS : ACTORS;

  function confirmActorPicker() {
    if (!actorPickerEntry || !selectedActorId) return;
    const actor = pickerActors.find((a) => a.id === selectedActorId) ?? pickerActors[0];
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4">
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
                <span className="absolute -top-2.5 left-[calc(60%-6px)] h-6 min-w-6 px-1 rounded-full border border-white bg-[var(--semantic-brand-danger)] text-white text-[10px] flex items-center justify-center">
                  {String(notInspectedCount).padStart(2, "0")}
                </span>
              )}
            </button>
          ))}
        </div>

        {hasUnsent && (
          <p className="flex flex-wrap items-center justify-end gap-0 text-base text-[var(--semantic-text-primary)] w-full">
            <span>※「</span>
            <UnsentIcon size={14} color="var(--semantic-text-primary)" />
            <span>」アイコンがあるものは未送信データです。ヘルプは</span>
            <Link to="/app/help" className="text-[var(--semantic-brand-primary)] underline">
              こちら
            </Link>
            <span>から。</span>
          </p>
        )}

        <button
          type="button"
          onClick={openFilterDialog}
          className="mt-2 bg-white flex gap-2 items-center justify-center h-12 px-4 rounded-lg shrink-0 text-base leading-none text-[var(--semantic-brand-primary)]"
        >
          {/* 確定デザイン（7139:293597）：高さ 48・16px */}
          絞り込み検索
          <img src={iconSearch} alt="検索" className="size-4" style={{ filter: "invert(24%) sepia(78%) saturate(2186%) hue-rotate(86deg)" }} />
        </button>

        {appliedFilters.size > 0 && (
          <div className="flex flex-wrap gap-4 items-center">
            {/* 確定デザイン（7139:293597）：「絞り込み条件」は 14px の黒、条件は枠線なしの白いチップ（高さ 40・14px） */}
            <span className="text-sm text-black shrink-0">絞り込み条件</span>
            {Array.from(appliedFilters).map((slug) => {
              const ledger = ledgerFor(slug);
              if (!ledger) return null;
              return (
                <span
                  key={slug}
                  className="bg-white h-10 rounded-lg flex items-center gap-1 px-2"
                >
                  <img src={ledger.appIcon} alt="" className="size-5 shrink-0" />
                  <span className="text-sm text-[var(--semantic-text-primary)]">{ledger.appLabel}</span>
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
          <AppEmptyState />
        ) : (
          grouped.map(([date, entries]) => (
            <div key={date} className="flex flex-col gap-4 items-start w-full">
              {/* 確定デザイン（7139:293597）：日付 20px・確認完了 14px・行 14px、帳票のカードに影 0 2 6（2026-10-07） */}
              <p className="text-xl leading-none text-[var(--semantic-text-primary)] border-b border-[#d0d0d0] w-full py-4">
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
                          {/* 確定デザイン（7139:293647）：215×36・左右 12px・間 4px */}
                          <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-end gap-1 h-9 px-3 rounded-t-lg w-fit max-w-full">
                            <span className="text-white text-sm shrink-0">確認完了</span>
                            <div className="bg-white h-3 rounded-full overflow-hidden w-[88px] shrink-0">
                              <div
                                className="bg-[var(--semantic-brand-primary)] h-full border border-white rounded-lg"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-white text-xl leading-none font-semibold shrink-0 min-w-[39px] text-right">
                              {confirmedCount}/{groupEntries.length}
                            </span>
                          </div>
                        </div>
                        <div className="w-full rounded-tl-lg rounded-b-lg shadow-[0px_2px_6px_rgba(51,51,51,0.24)]">
                        {/* 確定デザイン（7139:293647）：見出しは上から 16px・高さ 28、行は 32 の高さで線の上下 12px（間隔 56）、最後の行の下にも線 */}
                        <div className={`flex items-center justify-between w-full gap-2 bg-white px-4 pt-4 ${collapsed ? "pb-4 rounded-tl-lg rounded-bl-lg rounded-br-lg" : "pb-3 rounded-tl-lg"}`}>
                          <span className="flex items-center gap-2 h-7 text-xl leading-[1.4] text-[var(--semantic-brand-primary)] font-semibold">
                            {ledger && <img src={ledger.appIcon} alt="" className="size-6 shrink-0" />}
                            {ledger?.appLabel ?? slug}
                            {slug === "metal-xray-detection" && (
                              <span className="text-base text-[var(--semantic-text-secondary)] ml-2">金属探知機1号機</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleGroupExpanded(groupKey)}
                            aria-label={collapsed ? "開く" : "閉じる"}
                            className="text-[var(--semantic-brand-primary)] w-6 h-6 flex items-center justify-center shrink-0"
                          >
                            {/* 確定デザイン（7139:238645）は文字ではなく 24px の＋／－のアイコン（2026-10-08） */}
                            <span
                              aria-hidden
                              className="inline-block size-6"
                              style={{
                                WebkitMaskImage: `url("${collapsed ? iconPlusMask : iconMinusMask}")`,
                                maskImage: `url("${collapsed ? iconPlusMask : iconMinusMask}")`,
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                                backgroundColor: "currentColor",
                              }}
                            />
                          </button>
                        </div>
                        {!collapsed && (
                          <div className="flex flex-col gap-0 items-start w-full bg-white rounded-b-lg overflow-hidden px-4 pb-4">
                            {groupEntries.map((entry, idx) => (
                              <div key={entry.id} className="w-full">
                                <button
                                  type="button"
                                  onClick={() => handleEntryClick(entry)}
                                  className="flex items-center justify-between h-8 w-full text-left hover:bg-gray-50"
                                >
                                  <span className="text-sm text-[var(--semantic-text-primary)]">
                                    {entry.name}
                                  </span>
                                  <StatusBadge entry={entry} unsent={isUnsent(entry)} />
                                </button>
                                <div className={`border-b border-[#f1efea] mt-3 ${idx !== groupEntries.length - 1 ? "mb-3" : ""}`} />
                              </div>
                            ))}
                          </div>
                        )}
                        </div>
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
                        className="bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex items-center justify-between p-4 w-full text-left"
                      >
                        {/* 確定デザイン：カード 78（名前 18px・帳票名 14px） */}
                        <span className="flex flex-col gap-2 min-w-0">
                          <span className="text-lg leading-none text-[var(--semantic-text-primary)]">{entry.name}</span>
                          <span className="flex gap-1 items-center">
                            {ledger && <img src={ledger.appIcon} alt="" className="size-5 shrink-0" />}
                            <span className="text-sm text-[var(--semantic-brand-primary)]">
                              {ledger?.appLabel ?? entry.ledgerSlug}
                            </span>
                          </span>
                        </span>
                        <StatusBadge entry={entry} unsent={isUnsent(entry)} />
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-h-[calc(100vh-48px)]">
            {/* 高さは中身に合わせる（10 帳票だと固定の 754px では 4 段目が切れていた） */}
            {/* 確定デザイン（7139:221158・7139:229429）：見出しの高さ 34、カードは 180 幅で左から 24px 間隔 */}
            <h2 className="text-2xl leading-[34px] text-black">絞り込み条件</h2>
            <div className="grid grid-cols-[repeat(3,180px)] gap-6 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
              {visibleLedgerCategories(FILTER_LEDGERS).map((ledger) => {
                const selected = pickerSelected.has(ledger.slug);
                return (
                  <button
                    key={ledger.slug}
                    type="button"
                    onClick={() => toggleFilterLedger(ledger.slug)}
                    className={`flex flex-col items-center justify-center gap-2 h-28 rounded-lg shadow-[0px_2px_6px_rgba(51,51,51,0.24)] border-2 ${
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
            <div className="-mt-6 flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setFilterDialogOpen(false)}
                className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)] font-semibold"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white font-semibold"
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
            <h2 className="-mb-4 text-2xl text-black">実施者を選んでください</h2>
            <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
              {pickerActors.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => setSelectedActorId(actor.id)}
                  className={`h-[78px] rounded-lg flex flex-col items-center justify-center gap-1 px-4 shadow-[0px_2px_6px_rgba(51,51,51,0.24)] ${
                    selectedActorId === actor.id
                      ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                      : "bg-white border-2 border-transparent"
                  }`}
                >
                  <span className="text-lg leading-[1.4] text-[var(--semantic-text-primary)]">{actor.name}</span>
                  <span className="text-sm text-[var(--semantic-text-secondary)]">{actor.id}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeActorPicker}
                className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)] font-semibold"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={confirmActorPicker}
                disabled={!selectedActorId}
                className={`h-16 w-60 rounded-lg text-xl text-white font-semibold ${
                  selectedActorId ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
                }`}
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-8 w-[480px] max-w-[90vw]">
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
