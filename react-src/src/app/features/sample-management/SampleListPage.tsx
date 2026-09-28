import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { AppHeader } from "../../layout/AppHeader";
import { SampleProgressPanel } from "./SampleProgressPanel";
import { ACTORS } from "../cleaning-record/mockData";
import {
  DISCARD_REASON_LABELS,
  SAMPLE_ENTRIES,
  SAMPLE_STATUS_COLORS,
  SAMPLE_STATUS_LABELS,
  STORED_SAMPLES,
  type DiscardReason,
  type SampleTab,
} from "./mockData";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import checkboxOnIcon from "@images/Icon/ckeckbox_on.svg";
import checkboxOffIcon from "@images/Icon/ckeckbox.svg";
import searchIcon from "@images/Icon/search.svg";
import burnIcon from "@images/Icon/burn.svg";
import iconCheckWhite from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { StatusChip } from "../../components/StatusChip";
import { useDemoList, useDemoUninspected } from "../../../components/demo/demoStore";

function DestructionLabel() {
  return (
    <div className="bg-[var(--semantic-brand-danger)] flex flex-col items-center rounded shrink-0 w-10 p-0.5">
      <img src={burnIcon} alt="burn" className="w-6 h-6" />
      <span className="bg-white text-[var(--semantic-brand-danger)] text-[8px] rounded-b w-full text-center py-0.5">
        破棄対象
      </span>
    </div>
  );
}

type StoragePeriodFilter = "unspecified" | "manufactureDate" | "expiryDate";

type StorageFilter = {
  productName: string;
  period: StoragePeriodFilter;
  dateFrom: string;
  dateTo: string;
  destructionOnly: boolean;
};

const EMPTY_STORAGE_FILTER: StorageFilter = {
  productName: "",
  period: "unspecified",
  dateFrom: "",
  dateTo: "",
  destructionOnly: false,
};

const STORAGE_PERIOD_LABELS: Record<StoragePeriodFilter, string> = {
  unspecified: "未指定",
  manufactureDate: "製造日",
  expiryDate: "賞味期限",
};

export function SampleListPage() {
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const discardedId = (location.state as { discardedId?: string } | null)?.discardedId;
  const initialTab = (location.state as { tab?: SampleTab } | null)?.tab ?? "today";
  const [tab, setTab] = useState<SampleTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<StorageFilter>(EMPTY_STORAGE_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<StorageFilter>(EMPTY_STORAGE_FILTER);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [selectedForDiscard, setSelectedForDiscard] = useState<Set<string>>(new Set());
  const [bulkDiscardDialogOpen, setBulkDiscardDialogOpen] = useState(false);
  const [bulkDiscardDate, setBulkDiscardDate] = useState("");
  const [bulkDiscardReason, setBulkDiscardReason] = useState<DiscardReason | null>(null);
  const [bulkOtherReasonText, setBulkOtherReasonText] = useState("");
  const [bulkDiscardCompleteDialogOpen, setBulkDiscardCompleteDialogOpen] = useState(false);
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set(discardedId ? [discardedId] : []));

  // 動作デモの「データが無い」を試している間は、検体が 1 件も無い状態にする
  // 「今日」は今日採取する検体（点検予定）なので、動作デモ「データが無い」でも
  // 行は残したまま全部「未点検」にする。「保存品」は過去に保存した記録なので空にする。
  const sampleEntries = useDemoUninspected(SAMPLE_ENTRIES);
  const storedSamples = useDemoList(STORED_SAMPLES);

  const inspectedCount = sampleEntries.filter((entry) => entry.status === "inspected").length;

  const entries = useMemo(() => {
    return sampleEntries.filter((entry) => {
      if (entry.tab !== "today") return false;
      if (appliedQuery && !entry.productName.includes(appliedQuery)) return false;
      return true;
    });
  }, [sampleEntries, appliedQuery]);

  function handleSearch() {
    setAppliedQuery(searchQuery.trim());
  }

  const filteredStoredSamples = useMemo(() => {
    return storedSamples.filter((sample) => {
      if (discardedIds.has(sample.id)) return false;
      if (
        appliedFilter.productName &&
        !sample.productName.includes(appliedFilter.productName)
      )
        return false;
      if (appliedFilter.destructionOnly && !sample.destructionTarget) return false;
      if (appliedFilter.period === "manufactureDate") {
        if (appliedFilter.dateFrom && sample.manufactureDate < appliedFilter.dateFrom) return false;
        if (appliedFilter.dateTo && sample.manufactureDate > appliedFilter.dateTo) return false;
      } else if (appliedFilter.period === "expiryDate") {
        if (appliedFilter.dateFrom && sample.expiryDate < appliedFilter.dateFrom) return false;
        if (appliedFilter.dateTo && sample.expiryDate > appliedFilter.dateTo) return false;
      }
      return true;
    });
  }, [storedSamples, appliedFilter, discardedIds]);

  function openFilterDialog() {
    setFilterDraft(appliedFilter);
    setFilterDialogOpen(true);
  }

  function applyStorageFilter() {
    setAppliedFilter(filterDraft);
    setFilterDialogOpen(false);
  }

  function enterBulkSelectionMode() {
    setSelectedForDiscard(new Set());
    setBulkSelectionMode(true);
  }

  function exitBulkSelectionMode() {
    setBulkSelectionMode(false);
    setSelectedForDiscard(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedForDiscard((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedForDiscard(new Set(filteredStoredSamples.map((s) => s.id)));
  }

  function clearSelection() {
    setSelectedForDiscard(new Set());
  }

  function openBulkDiscardDialog() {
    setBulkDiscardDate("");
    setBulkDiscardReason("expired");
    setBulkDiscardDialogOpen(true);
  }

  const canBulkDiscard = bulkDiscardDate.trim() !== "" && bulkDiscardReason !== null;

  function handleBulkDiscard() {
    if (!canBulkDiscard) return;
    setDiscardedIds((prev) => new Set([...prev, ...selectedForDiscard]));
    setBulkDiscardDialogOpen(false);
    exitBulkSelectionMode();
    setBulkDiscardCompleteDialogOpen(true);
  }

  function handleBulkCompleteClose() {
    setBulkDiscardCompleteDialogOpen(false);
  }

  const [progressOpen, setProgressOpen] = useState(false);
  const inspectedSamples = sampleEntries.filter((s) => s.status === "inspected");

  return (
    <>
      <AppHeader
        title="検体管理"
        action={
          <button
            type="button"
            onClick={() => setProgressOpen(true)}
            className="bg-[var(--semantic-brand-primary)] flex items-center rounded-lg overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0 mx-2 text-white"
              style={{
                WebkitMaskImage: `url("${iconArrowLeft}")`,
                maskImage: `url("${iconArrowLeft}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "currentColor",
              }}
            />
            <span className="bg-white flex flex-col items-center justify-center gap-0 px-2 py-1">
              <span className="text-xs text-[var(--semantic-brand-primary)] font-semibold">点検済み</span>
              <span className="text-lg text-[var(--semantic-brand-primary)] leading-none font-bold">
                {inspectedCount}/{sampleEntries.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-10 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full">
          <div className="bg-white flex h-10 items-center rounded-lg w-full shrink-0">
            {(["today", "storage"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  exitBulkSelectionMode();
                }}
                className={`flex-1 h-10 p-2 rounded-lg text-lg ${
                  tab === key
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "text-[var(--semantic-text-secondary)]"
                }`}
              >
                {key === "today" ? "本日の点検" : "保管検体"}
              </button>
            ))}
          </div>

          {tab === "today" ? (
            <>
              <div className="flex gap-4 items-start w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                  placeholder="製品名を入力"
                  className="flex-1 h-12 p-4 rounded-lg border border-[var(--semantic-text-secondary)] bg-[var(--semantic-background-surface)] text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="h-12 w-30 rounded-lg border border-[var(--semantic-brand-primary)] bg-[var(--semantic-background-surface)] text-base text-[var(--semantic-brand-primary)] shrink-0"
                >
                  検索
                </button>
              </div>

              <div className="flex flex-col gap-6 items-start w-full">
                {entries.length === 0 ? (
                  <p className="text-base text-[var(--semantic-text-secondary)] text-center py-6 w-full">
                    {sampleEntries.length === 0
                      ? "本日の検体はまだありません"
                      : "該当する検体はありません"}
                  </p>
                ) : (
                  entries.map((entry) => (
                    <Link
                      key={entry.id}
                      to={`/app/ledger-list/sample-management/samples/${entry.id}`}
                      state={{ inspectorName }}
                      className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center justify-between p-4 rounded-lg w-full"
                    >
                      {/* 製造日・ロットNo. は管理画面で「記載する」とした製品だけに出る任意項目 */}
                      <div className="flex-1 flex flex-col gap-2 items-start justify-center min-w-0">
                        <p className="text-lg text-[var(--semantic-text-primary)]">{entry.productName}</p>
                        {(entry.manufactureDate || entry.lotNumber) && (
                          <div className="flex gap-6 items-center">
                            {entry.manufactureDate && (
                              <div className="flex gap-2 items-center">
                                <span className="text-base text-[var(--semantic-text-secondary)]">製造日</span>
                                <span className="text-base text-[var(--semantic-text-primary)]">
                                  {entry.manufactureDate.replaceAll("-", "/")}
                                </span>
                              </div>
                            )}
                            {entry.lotNumber && (
                              <div className="flex gap-2 items-center">
                                <span className="text-base text-[var(--semantic-text-secondary)]">ロットNo.</span>
                                <span className="text-base text-[var(--semantic-text-primary)]">{entry.lotNumber}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <StatusChip color={SAMPLE_STATUS_COLORS[entry.status]}>{SAMPLE_STATUS_LABELS[entry.status]}</StatusChip>
                    </Link>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-end w-full">
                {!bulkSelectionMode ? (
                  <button
                    type="button"
                    onClick={enterBulkSelectionMode}
                    className="bg-white border border-[var(--semantic-brand-danger)] h-12 px-4 rounded-lg text-base text-[var(--semantic-brand-danger)] shrink-0"
                  >
                    破棄する製品を選ぶ
                  </button>
                ) : selectedForDiscard.size > 0 ? (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="bg-white border border-[var(--semantic-brand-danger)] h-12 px-4 rounded-lg text-base text-[var(--semantic-brand-danger)] shrink-0"
                  >
                    全ての選択を解除
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={selectAll}
                    className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] shrink-0 flex items-center gap-2"
                  >
                    <img src={checkboxOffIcon} alt="checkbox" className="size-5" />
                    すべて選択
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={openFilterDialog}
                className="bg-white flex gap-2 items-center justify-center p-4 rounded-lg w-full text-base text-[var(--semantic-brand-primary)]"
              >
                絞り込み検索
                <span
                  className="inline-block w-5 h-5 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${searchIcon}")`,
                    maskImage: `url("${searchIcon}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
              </button>

              <div className="flex flex-col gap-6 items-start w-full">
                {filteredStoredSamples.length === 0 ? (
                  <p className="text-base text-[var(--semantic-text-secondary)] text-center py-6 w-full">
                    {storedSamples.length === 0
                      ? "保管中の検体はまだありません"
                      : "該当する検体はありません"}
                  </p>
                ) : (
                  filteredStoredSamples.map((sample) => {
                    const cardContent = (
                      <>
                        <div className="flex-1 flex flex-col gap-2 items-start min-w-0">
                          <p className="text-lg text-[var(--semantic-text-primary)]">{sample.productName}</p>
                          <div className="flex gap-6 items-start">
                            <div className="flex gap-2 items-center">
                              <span className="text-base text-[var(--semantic-text-secondary)]">製造日</span>
                              <span className="text-base text-[var(--semantic-text-primary)]">
                                {sample.manufactureDate.replaceAll("-", "/")}
                              </span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-base text-[var(--semantic-text-secondary)]">賞味期限</span>
                              <span className="text-base text-[var(--semantic-text-primary)]">
                                {sample.expiryDate.replaceAll("-", "/")}
                              </span>
                            </div>
                          </div>
                        </div>
                        {sample.destructionTarget && <DestructionLabel />}
                      </>
                    );

                    if (bulkSelectionMode) {
                      const checked = selectedForDiscard.has(sample.id);
                      return (
                        <div key={sample.id} className="flex gap-2 items-center w-full">
                          <button
                            type="button"
                            onClick={() => toggleSelected(sample.id)}
                            className="size-10 flex items-center justify-center shrink-0"
                          >
                            <img src={checked ? checkboxOnIcon : checkboxOffIcon} alt="checkbox" className="size-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSelected(sample.id)}
                            className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg flex-1 text-left"
                          >
                            {cardContent}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={sample.id}
                        to={`/app/ledger-list/sample-management/stored/${sample.id}`}
                        className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full"
                      >
                        {cardContent}
                      </Link>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {!bulkSelectionMode && (
          <Link
            to="/app/ledger-list"
            className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center px-4 py-6 rounded-lg w-90 max-w-full"
          >
            <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
          </Link>
        )}
      </div>

      {bulkSelectionMode && (
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={exitBulkSelectionMode}
            className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            disabled={selectedForDiscard.size === 0}
            onClick={openBulkDiscardDialog}
            className={`h-16 w-60 rounded-lg text-xl text-white ${
              selectedForDiscard.size > 0 ? "bg-[var(--semantic-brand-danger)]" : "bg-[#d0d0d0]"
            }`}
          >
            一括破棄
          </button>
        </div>
      )}

      {filterDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-full mx-16 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <h2 className="text-2xl text-black text-center w-full">絞り込み条件</h2>
            <div className="flex flex-col gap-6 items-start w-full">
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)]">製品名</p>
                <input
                  type="text"
                  value={filterDraft.productName}
                  onChange={(e) =>
                    setFilterDraft((prev) => ({ ...prev, productName: e.target.value }))
                  }
                  placeholder="製品名を入力"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full border border-[#808080] placeholder:text-[var(--semantic-text-secondary)]"
                />
              </div>

              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)]">期間</p>
                <div className="flex flex-wrap gap-4 w-full">
                  {(["unspecified", "manufactureDate", "expiryDate"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setFilterDraft((prev) => ({ ...prev, period }))}
                      className={`h-12 w-34 rounded-lg text-base border ${
                        filterDraft.period === period
                          ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                      }`}
                    >
                      {STORAGE_PERIOD_LABELS[period]}
                    </button>
                  ))}
                </div>
                {filterDraft.period !== "unspecified" && (
                  <div className="flex gap-2 items-center w-full">
                    <DateFilterInput
                      value={filterDraft.dateFrom}
                      onChange={(value) => setFilterDraft((prev) => ({ ...prev, dateFrom: value }))}
                      className="flex-1"
                    />
                    <span className="text-lg text-[var(--semantic-text-primary)]">〜</span>
                    <DateFilterInput
                      value={filterDraft.dateTo}
                      onChange={(value) => setFilterDraft((prev) => ({ ...prev, dateTo: value }))}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setFilterDraft((prev) => ({ ...prev, destructionOnly: !prev.destructionOnly }))
                }
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] flex items-center gap-2"
              >
                <img src={filterDraft.destructionOnly ? checkboxOnIcon : checkboxOffIcon} alt="checkbox" className="size-5" />
                破棄対象のみ
              </button>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setFilterDialogOpen(false)}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={applyStorageFilter}
                className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
              >
                絞り込み
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDiscardDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBulkDiscardDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-full mx-16 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-6 items-center w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">検体一括破棄</h2>
              <p className="text-base text-[var(--semantic-text-primary)] w-full">
                一括破棄の場合には、全て同じ破棄日・理由が登録されます。ご注意ください。
              </p>

              <div className="bg-white flex flex-col items-center max-h-56 overflow-y-auto overflow-x-hidden px-4 rounded-lg w-full">
                {STORED_SAMPLES.filter((sample) => selectedForDiscard.has(sample.id)).map(
                  (sample, index) => (
                    <div
                      key={sample.id}
                      className={`flex gap-2 items-center py-2 w-full ${
                        index > 0 ? "border-t border-[#d0d0d0]" : ""
                      }`}
                    >
                      <div className="flex-1 flex flex-col gap-1 items-start min-w-0">
                        <div className="flex gap-2 items-center">
                          <span className="text-sm text-[var(--semantic-text-secondary)]">製品名</span>
                          <span className="text-sm text-[var(--semantic-text-primary)]">
                            {sample.productName}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-sm text-[var(--semantic-text-secondary)]">賞味期限</span>
                          <span className="text-sm text-[var(--semantic-text-primary)]">
                            {sample.expiryDate.replaceAll("-", "/")}
                          </span>
                        </div>
                      </div>
                      {sample.destructionTarget && <DestructionLabel />}
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  破棄日 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <DateFilterInput value={bulkDiscardDate} onChange={setBulkDiscardDate} />
              </div>

              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  理由 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex flex-wrap gap-4 w-full">
                  {(["expired", "other"] as const).map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setBulkDiscardReason(reason);
                        if (reason !== "other") setBulkOtherReasonText("");
                      }}
                      className={`h-12 w-34 rounded-lg text-base border ${
                        bulkDiscardReason === reason
                          ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                      }`}
                    >
                      {DISCARD_REASON_LABELS[reason]}
                    </button>
                  ))}
                </div>
                {bulkDiscardReason === "other" && (
                  <input
                    type="text"
                    value={bulkOtherReasonText}
                    onChange={(e) => setBulkOtherReasonText(e.target.value)}
                    placeholder="理由を入力してください"
                    className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full border border-[#d0d0d0] placeholder:text-[var(--semantic-text-secondary)]"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setBulkDiscardDialogOpen(false)}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!canBulkDiscard}
                onClick={handleBulkDiscard}
                className={`h-16 w-60 rounded-lg text-xl text-white ${
                  canBulkDiscard ? "bg-[var(--semantic-brand-danger)]" : "bg-[#d0d0d0]"
                }`}
              >
                一括破棄
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDiscardCompleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleBulkCompleteClose} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-full max-w-[480px]">
            <div className="flex flex-col gap-4 items-center w-full">
              <div className="w-16 h-16 rounded-full bg-[var(--semantic-status-success)] flex items-center justify-center">
                <img src={iconCheckWhite} alt="" aria-hidden="true" className="size-10" />
              </div>
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center">廃棄が完了しました</h2>
            </div>
            <button
              type="button"
              onClick={handleBulkCompleteClose}
              className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      )}

      {progressOpen && <SampleProgressPanel samples={sampleEntries} inspectedSamples={inspectedSamples} onClose={() => setProgressOpen(false)} />}
    </>
  );
}
