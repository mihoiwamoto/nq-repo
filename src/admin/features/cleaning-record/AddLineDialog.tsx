import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { LineFrequency } from "./types";
import { useCleaningRecord } from "./CleaningRecordContext";

const TABS: { key: LineFrequency; label: string }[] = [
  { key: "daily", label: "毎日" },
  { key: "weekly", label: "毎週" },
  { key: "monthly", label: "毎月" },
  { key: "yearly", label: "毎年" },
];

export function AddLineDialog({
  selectedIds,
  onClose,
  onConfirm,
}: {
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { lines } = useCleaningRecord();
  const [activeTab, setActiveTab] = useState<LineFrequency>("daily");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    setDraft(selectedIds);
  }, [selectedIds]);

  const filteredLines = lines.filter(
    (line) => line.frequency === activeTab && line.name.includes(search)
  );

  function toggleLine(id: string) {
    setDraft((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
        <h2 className="text-2xl text-black text-center w-full">持ち場/ライン名</h2>
        <div className="flex flex-col gap-4 items-start w-full">
          <div className="flex gap-4 items-start w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="持ち場/ライン名を入力"
              className="bg-white border border-[#808080] flex-1 h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
            />
            <button
              type="button"
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              検索
            </button>
          </div>
          <div className="bg-white flex h-10 items-center rounded-lg w-full">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 h-10 rounded-lg text-lg ${
                  activeTab === tab.key
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "text-[var(--semantic-text-secondary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-white flex flex-col h-[308px] overflow-y-auto px-4 rounded-lg w-full">
            {filteredLines.length === 0 ? (
              <p className="py-4 text-sm text-[var(--semantic-text-secondary)]">
                該当する持ち場/ラインがありません
              </p>
            ) : (
              filteredLines.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => toggleLine(line.id)}
                  className="border-b border-[#d0d0d0] flex gap-2 items-center min-h-12 py-2 w-full text-left"
                >
                  <input
                    type="checkbox"
                    checked={draft.includes(line.id)}
                    readOnly
                    className="size-4 accent-[var(--semantic-brand-primary)]"
                  />
                  <span
                    className={`text-sm ${
                      draft.includes(line.id)
                        ? "text-[var(--semantic-brand-primary)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    【{TABS.find((t) => t.key === line.frequency)?.label}】{line.name}
                  </span>
                </button>
              ))
            )}
          </div>
          <Link
            to={`/admin/ledger-management/cleaning-record/factories/${factoryId}/lines/new`}
            className="text-sm text-[var(--semantic-brand-primary)]"
          >
            + 新しい持ち場/ラインを登録する
          </Link>
        </div>
        <div className="flex gap-10 items-center justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={() => onConfirm(draft)}
            className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
