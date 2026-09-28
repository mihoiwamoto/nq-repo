import { Fragment, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";
import iconCheckbox from "@images/Icon/ckeckbox.svg";
import iconCheckboxOn from "@images/Icon/ckeckbox_on.svg";
import { useInspection } from "./InspectionContext";
import { FREQUENCY_LABELS, type Frequency } from "./mockData";

const PICKER_FREQUENCIES: Frequency[] = ["weekly", "monthly", "yearly"];

function formatDateSlash(dateKey: string) {
  const [y, m, d] = dateKey.split("-");
  return `${y}/${m}/${d}`;
}

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
      <AppHeader title="機械器具点検 点検管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4 items-center">
        {/* 日付（点検予定日。ルートで決まるため変更不可） */}
        <div className="flex items-center justify-between w-full">
          <p className="flex gap-1 items-center text-lg text-[var(--semantic-text-primary)]">
            日付
            <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <div className="bg-[#d0d0d0] flex gap-2 h-12 items-center justify-end px-4 rounded-lg w-[200px] max-w-[50%] shrink-0">
            <p className="flex-1 min-w-0 text-base text-[var(--semantic-text-primary)]">
              {formatDateSlash(dateKey)}
            </p>
            <img src={iconCalendar} alt="" aria-hidden className="size-6 shrink-0" />
          </div>
        </div>

        <div className="h-px w-full bg-[#d0d0d0]" />

        <div className="flex flex-col items-start overflow-hidden rounded-lg w-full">
          <div className="bg-white flex gap-2 h-16 items-center justify-between p-2 w-full">
            <p className="flex gap-1 items-center text-lg text-[var(--semantic-text-primary)]">
              持ち場/ライン名
              <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            {viewMode === "view" ? (
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-1 h-12 items-center justify-center rounded-lg text-base text-[var(--semantic-brand-primary)] w-[200px] max-w-[50%] shrink-0"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${iconEdit}")`,
                    maskImage: `url("${iconEdit}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
                編集
              </button>
            ) : (
              <button
                type="button"
                onClick={openPicker}
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-1 h-12 items-center justify-center rounded-lg text-base text-[var(--semantic-brand-primary)] w-[200px] max-w-[50%] shrink-0"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${iconPlus}")`,
                    maskImage: `url("${iconPlus}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
                追加
              </button>
            )}
          </div>
          <div className="h-px w-full bg-[#d0d0d0]" />
          <div className="bg-white flex flex-col gap-4 items-center p-4 w-full">
            {lineIds.length === 0 ? (
              <div className="flex h-12 items-center w-full">
                <p className="text-sm text-[var(--semantic-text-primary)]">
                  登録された持ち場/ライン名がありません
                </p>
              </div>
            ) : (
              lineIds.map((lineId, index) => (
                <Fragment key={lineId}>
                  {index > 0 && <div className="h-px w-full bg-[#d0d0d0]" />}
                  <div className="flex gap-2 h-12 items-center pr-2 w-full">
                    <p className="flex-1 min-w-0 text-sm text-[var(--semantic-text-primary)]">
                      {lineLabel(lineId)}
                    </p>
                    {viewMode === "edit" && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(lineId)}
                        className="bg-white border border-[var(--semantic-brand-danger)] size-8 rounded-lg flex items-center justify-center shrink-0"
                      >
                        <img src={iconTrash} alt="削除" className="size-5" />
                      </button>
                    )}
                  </div>
                </Fragment>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex gap-6 items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 max-w-full rounded-lg px-4 text-xl text-[var(--semantic-text-primary)] shrink-0"
        >
          戻る
        </button>
        {viewMode === "edit" && (
          <button
            type="button"
            disabled={lineIds.length === 0}
            onClick={handleSave}
            className={`h-16 w-60 max-w-full rounded-lg px-4 text-xl text-white shrink-0 ${
              lineIds.length === 0
                ? "bg-[var(--semantic-text-secondary)] opacity-50"
                : "bg-[var(--semantic-brand-primary)]"
            }`}
          >
            {existing ? "保存" : "登録"}
          </button>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPickerOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[calc(100%-32px)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">持ち場/ライン名</h2>
            <div className="flex flex-col gap-4 items-start w-full">
              <div className="flex gap-4 items-start w-full">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="持ち場/ライン名を入力"
                  className="flex-1 min-w-0 bg-white border border-[var(--semantic-text-secondary)] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <button
                  type="button"
                  className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-base text-[var(--semantic-brand-primary)] shrink-0"
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
                    className={`flex-1 h-10 rounded-lg text-lg ${
                      pickerTab === freq
                        ? "bg-[var(--semantic-brand-primary)] text-white"
                        : "text-[var(--semantic-text-secondary)]"
                    }`}
                  >
                    {FREQUENCY_LABELS[freq]}
                  </button>
                ))}
              </div>
              <div className="bg-white flex flex-col items-center rounded-lg w-full h-[308px] px-4 overflow-y-auto overflow-x-hidden">
                {pickerLines.length === 0 ? (
                  <p className="text-sm text-[var(--semantic-text-secondary)] py-4 w-full">
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
                        className="flex gap-2 items-center min-h-12 py-2 w-full shrink-0 border-b border-[#d0d0d0] last:border-b-0 text-left"
                      >
                        <span className="flex gap-1 items-center min-w-0">
                          <img
                            src={checked ? iconCheckboxOn : iconCheckbox}
                            alt=""
                            aria-hidden
                            className="size-4 shrink-0"
                          />
                          <span
                            className={`text-sm truncate ${
                              checked
                                ? "text-[var(--semantic-brand-primary)]"
                                : "text-[var(--semantic-text-primary)]"
                            }`}
                          >
                            【{FREQUENCY_LABELS[line.frequency]}】{line.name}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 max-w-full rounded-lg text-xl text-[var(--semantic-text-primary)] shrink-0"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={confirmPicker}
                className="bg-[var(--semantic-brand-primary)] h-16 w-60 max-w-full rounded-lg text-xl text-white shrink-0"
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
