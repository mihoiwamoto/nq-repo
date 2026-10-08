import { Fragment, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { ProgressSubmitComplete } from "../../components/ProgressSubmitComplete";
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

type ResultKind = "registered" | "saved" | null;

export function SchedulePointSettingPage() {
  const { dateKey } = useParams<{ dateKey: string }>();
  const navigate = useNavigate();
  const { lines, entries, upsertEntry } = useInspection();

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
    // 持ち場/ラインが 0 件のときは「保存」を押せない。予定の削除完了の画面は作らない（確定デザインから外した。2026-10-07）
    if (lineIds.length === 0) return;
    upsertEntry(scheduleDateKey, lineIds);
    setResult(existing ? "saved" : "registered");
  }

  if (result) {
    const message = result === "saved" ? "保存が完了しました！" : "登録が完了しました！";
    // 確定デザイン（7139:283879・7139:283906）：進捗一覧の提出完了と同じ上寄せの完了画面（ボタン 360×64）
    return (
      <ProgressSubmitComplete
        ledgerTitle="機械器具点検 持ち場/ライン設定"
        title={message}
        message="ご登録ありがとうございます。"
        backLabel="点検予定に戻る"
        onBack={() => navigate("/app/schedule")}
      />
    );
  }

  const pickerLines = lines.filter(
    (line) => line.frequency === pickerTab && line.name.includes(pickerSearch)
  );

  return (
    <>
      {/* 見出しは一覧（点検予定）と完了画面に合わせて「持ち場/ライン設定」（確定デザイン 7782:358） */}
      <AppHeader title="機械器具点検 持ち場/ライン設定" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4 items-center">
        {viewMode === "view" ? (
          <div className="flex flex-col gap-2 items-center w-full">
            {/* 詳細（確定デザイン 7139:283279）：右上に「編集」、カードに「日時」と「持ち場/ライン名（左）／値（右寄せ）」の行 */}
            <div className="flex items-center justify-end w-full">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                // 確定デザイン（7139:283279）：96×44、下のカードまで 8px
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-1 h-11 w-24 items-center justify-center rounded-lg text-lg text-[var(--semantic-brand-primary)] shrink-0"
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
            </div>
            <div className="bg-white flex flex-col items-start overflow-hidden rounded-lg w-full">
              <div className="flex h-16 items-center justify-between px-4 w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">日時</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{formatDateSlash(dateKey)}</p>
              </div>
              <div className="h-px w-full bg-[#d0d0d0]" />
              {/* 行は高さ 40・区切り線の上下 16px（間隔 72） */}
              <div className="flex flex-col items-center px-4 py-4 w-full">
                {lineIds.map((lineId, index) => (
                  <Fragment key={lineId}>
                    {index > 0 && <div className="h-px w-full bg-[#d0d0d0] my-4" />}
                    <div className="flex gap-4 h-10 items-center w-full">
                      <p className="shrink-0 text-base text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
                      <p className="flex-1 min-w-0 text-base text-right text-[var(--semantic-text-primary)]">
                        {lineLabel(lineId)}
                      </p>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
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

            {/* 新規登録・編集（確定デザイン 7139:284073・7139:284129）：行は「持ち場/ライン名（左）／値（右寄せ）」とゴミ箱 */}
            <div className="flex flex-col items-start overflow-hidden rounded-lg w-full">
              <div className="bg-white flex gap-2 h-16 items-center justify-between p-2 w-full">
                <p className="flex gap-1 items-center text-lg text-[var(--semantic-text-primary)]">
                  持ち場/ライン名
                  <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
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
              </div>
              <div className="h-px w-full bg-[#d0d0d0]" />
              {/* 行は高さ 40・区切り線の上下 16px（間隔 72）。空のときも高さ 72 */}
              <div className="bg-white flex flex-col items-center px-4 py-4 w-full">
                {lineIds.length === 0 ? (
                  <div className="flex h-10 items-center w-full">
                    <p className="text-sm text-[var(--semantic-text-primary)]">
                      登録された持ち場/ライン名がありません
                    </p>
                  </div>
                ) : (
                  lineIds.map((lineId, index) => (
                    <Fragment key={lineId}>
                      {index > 0 && <div className="h-px w-full bg-[#d0d0d0] my-4" />}
                      <div className="flex gap-4 h-10 items-center w-full">
                        <p className="shrink-0 text-base text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
                        <p className="flex-1 min-w-0 text-base text-right text-[var(--semantic-text-primary)]">
                          {lineLabel(lineId)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(lineId)}
                          className="bg-white border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center shrink-0"
                        >
                          <img src={iconTrash} alt="削除" className="size-6" />
                        </button>
                      </div>
                    </Fragment>
                  ))
                )}
              </div>
            </div>
          </>
        )}
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
          {/* 確定デザイン（7139:284185）：幅 640、題は「{持ち場/ライン名}の削除」、ボタンは大きい「キャンセル」（枠線）と「削除」 */}
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[calc(100%-32px)]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {lineLabel(deleteTarget)}の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 max-w-full rounded-lg text-xl text-[var(--semantic-text-primary)] shrink-0"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-[var(--semantic-brand-danger)] h-16 w-60 max-w-full rounded-lg text-xl text-white shrink-0"
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
