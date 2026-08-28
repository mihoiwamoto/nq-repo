import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import { useInspection } from "./InspectionContext";
import { FREQUENCY_LABELS, type Frequency } from "./mockData";
import { formatDateLabel } from "./calendarUtils";

const PICKER_FREQUENCIES: Frequency[] = ["weekly", "monthly", "yearly"];

type ResultKind = "registered" | "saved" | "deleted" | null;

export function SchedulePointSettingPage() {
  const { dateKey } = useParams<{ dateKey: string }>();
  const navigate = useNavigate();
  const { lines, entries, upsertEntry, removeEntry } = useInspection();

  const existing = dateKey ? entries[dateKey] : undefined;
  const [viewMode, setViewMode] = useState<"view" | "edit">(existing ? "view" : "edit");
  const [lineIds, setLineIds] = useState<string[]>(existing?.lineIds ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [pickerTab, setPickerTab] = useState<Frequency>("weekly");
  const [pickerSearch, setPickerSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [result, setResult] = useState<ResultKind>(null);

  if (!dateKey) return null;
  const scheduleDateKey: string = dateKey;

  function lineLabel(lineId: string) {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return lineId;
    return `【${FREQUENCY_LABELS[line.frequency]}】${line.name}`;
  }

  function openPicker() {
    setPickerSelected(new Set(lineIds));
    setPickerTab("weekly");
    setPickerSearch("");
    setPickerOpen(true);
  }

  function togglePickerLine(lineId: string) {
    setPickerSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }

  function confirmPicker() {
    setLineIds(Array.from(pickerSelected));
    setPickerOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setLineIds((prev) => prev.filter((id) => id !== deleteTarget));
    setDeleteTarget(null);
  }

  function handleSave() {
    if (lineIds.length === 0) {
      if (existing) {
        removeEntry(scheduleDateKey);
        setResult("deleted");
      }
      return;
    }
    upsertEntry(scheduleDateKey, lineIds);
    setResult(existing ? "saved" : "registered");
  }

  if (result) {
    const message =
      result === "deleted"
        ? "機械器具点検の削除が完了しました！"
        : result === "saved"
          ? "保存が完了しました！"
          : "登録が完了しました！";
    return (
      <>
        <AppHeader title="機械器具点検 点検設定" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[var(--semantic-brand-primary)]">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
            <path d="M24 41L34 51L56 29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-2xl text-[var(--semantic-brand-primary)]">{message}</p>
          {result !== "deleted" && (
            <p className="text-base text-[var(--semantic-text-primary)]">ご登録ありがとうございます。</p>
          )}
          <button
            type="button"
            onClick={() => navigate("/app/schedule")}
            className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
          >
            点検予定に戻る
          </button>
        </div>
      </>
    );
  }

  const pickerLines = lines.filter(
    (line) => line.frequency === pickerTab && line.name.includes(pickerSearch)
  );

  return (
    <>
      <AppHeader
        title="機械器具点検 点検管理"
        action={
          viewMode === "view" ? (
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)]"
            >
              <img src={iconEdit} alt="編集" className="size-4" />
              編集
            </button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col items-start rounded-lg w-full max-w-full max-w-[480px] mx-40 overflow-hidden">
          <div className="flex items-center justify-between w-full px-4 py-4 bg-[var(--semantic-background-page)]">
            <p className="text-base text-[var(--semantic-text-primary)] flex items-center gap-1">
              日付 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">{formatDateLabel(dateKey)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          {viewMode === "edit" && (
            <div className="flex items-center justify-between w-full px-4 py-4">
              <p className="text-base text-[var(--semantic-text-primary)] flex items-center gap-1">
                持ち場/ライン名 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <button
                type="button"
                onClick={openPicker}
                className="bg-white border border-[var(--semantic-brand-primary)] h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)]"
              >
                ＋ 追加
              </button>
            </div>
          )}

          {lineIds.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)] px-4 py-4">
              {viewMode === "edit"
                ? "登録されている持ち場/ライン名がありません"
                : "登録されている持ち場/ライン名がありません"}
            </p>
          ) : (
            lineIds.map((lineId) => (
              <div key={lineId} className="flex items-center justify-between w-full px-4 py-4 border-t border-[#d0d0d0]">
                <p className="text-base text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
                <div className="flex items-center gap-2">
                  <p className="text-base text-[var(--semantic-text-primary)]">{lineLabel(lineId)}</p>
                  {viewMode === "edit" && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(lineId)}
                      className="bg-white border border-[var(--semantic-brand-danger)] size-8 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <img src={iconTrash} alt="削除" className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-34 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
        >
          戻る
        </button>
        {viewMode === "edit" && (
          <button
            type="button"
            disabled={lineIds.length === 0}
            onClick={handleSave}
            className={`h-16 px-6 rounded-lg text-xl ${
              lineIds.length === 0
                ? "bg-[#d0d0d0] text-white"
                : "bg-[var(--semantic-brand-primary)] text-white"
            }`}
          >
            {existing ? "保存" : "登録"}
          </button>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPickerOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-8 w-full max-w-[480px] mx-40 max-h-[85vh]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">持ち場/ライン名</h2>
            <div className="flex gap-2 items-center w-full">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="持ち場/ライン名を入力"
                className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <button
                type="button"
                className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg text-base text-[var(--semantic-brand-primary)] shrink-0"
              >
                検索
              </button>
            </div>
            <div className="bg-white flex h-10 items-center rounded-lg w-full">
              {PICKER_FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setPickerTab(freq)}
                  className={`flex-1 h-10 rounded-lg text-base ${
                    pickerTab === freq
                      ? "bg-[var(--semantic-brand-primary)] text-white"
                      : "text-[var(--semantic-text-secondary)]"
                  }`}
                >
                  {FREQUENCY_LABELS[freq]}
                </button>
              ))}
            </div>
            <div className="bg-white flex flex-col items-start rounded-lg w-full overflow-y-auto overflow-x-hidden flex-1">
              {pickerLines.length === 0 ? (
                <p className="text-base text-[var(--semantic-text-secondary)] px-4 py-4">
                  該当する持ち場/ラインがありません
                </p>
              ) : (
                pickerLines.map((line) => {
                  const checked = pickerSelected.has(line.id);
                  return (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => togglePickerLine(line.id)}
                      className="flex items-center gap-2 px-4 py-3 w-full border-b border-[#d0d0d0] last:border-b-0 text-left"
                    >
                      <span
                        className={
                          checked
                            ? "text-[var(--semantic-brand-primary)]"
                            : "text-[var(--semantic-text-secondary)]"
                        }
                      >
                        {checked ? "●" : "○"}
                      </span>
                      <span className="text-base text-[var(--semantic-text-primary)]">
                        【{FREQUENCY_LABELS[line.frequency]}】{line.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex gap-4 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-40 rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={confirmPicker}
                className="bg-[var(--semantic-brand-primary)] h-12 w-40 rounded-lg text-base text-white"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {lineLabel(deleteTarget)}の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-[var(--semantic-brand-danger)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
