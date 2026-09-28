import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { DateFilterInput } from "../../components/DateFilterInput";
import { recordTimestamp, todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { AppHeader } from "../../layout/AppHeader";
import { useCleaningRecord } from "./CleaningRecordContext";
import {
  ACTORS,
  cleaningPoints,
  initialRecords,
  initialRemarks,
  pendingReviewRecords,
  skippedRemarks,
  type CleaningItemRecord,
} from "./mockData";
import iconCheckbox from "@images/Icon/ckeckbox.svg";
import iconCheckboxOn from "@images/Icon/ckeckbox_on.svg";

function keyFor(location: string, item: string) {
  return `${location}|${item}`;
}

function orderedRecordKeys() {
  return cleaningPoints.flatMap((point) => point.items.map((item) => keyFor(point.location, item)));
}

/**
 * ステータスに応じた記録の初期状態。
 * initialRecords に無い項目は pendingReviewRecords で補い、点検済みなら全項目そろった状態にする。
 */
function seedRecords(fill: RecordFill): Record<string, CleaningItemRecord> {
  const entries = fillSlice(orderedRecordKeys(), fill)
    .map((key) => [key, initialRecords[key] ?? pendingReviewRecords[key]] as const)
    .filter(([, record]) => Boolean(record));
  return Object.fromEntries(entries);
}

function isAllDone(records: Record<string, CleaningItemRecord>) {
  return cleaningPoints.every((point) =>
    point.items.every((item) => records[keyFor(point.location, item)]?.status === "done")
  );
}

export function RecordingPage() {
  const { lineId } = useParams<{ lineId: string }>();
  const { lines } = useCleaningRecord();
  const navigate = useNavigate();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;

  const line = lines.find((l) => l.id === lineId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const lineFill: RecordFill =
    line?.status === "not_inspected" || line?.status === "skipped"
      ? "none"
      : line?.status === "in_progress"
        ? "partial"
        : "full";
  const fill = progressFill ?? lineFill;
  const hasStarted = fill !== "none";
  // 見送りのラインは清掃自体を行っていないので、記録は空・備考に見送り理由だけを表示する
  const isSkipped = progressFill === null && line?.status === "skipped";

  const [date, setDate] = useState(() => (hasStarted ? line?.inspectionDate || todayString() : todayString()));
  const [records, setRecords] = useState<Record<string, CleaningItemRecord>>(() =>
    isSkipped ? {} : seedRecords(fill),
  );
  const [remarks, setRemarks] = useState(() =>
    isSkipped ? skippedRemarks : hasStarted ? initialRemarks : "",
  );
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [deferToTomorrow, setDeferToTomorrow] = useState<boolean | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const lineName = line?.name ?? "ゆばライン";
  const isDaily = (line?.frequency ?? "daily") === "daily";
  const allDone = isAllDone(records);

  function setStatus(location: string, item: string, status: "done" | null) {
    const key = keyFor(location, item);
    setRecords((prev) => ({
      ...prev,
      [key]:
        status === "done"
          ? { status: "done", timestamp: recordTimestamp(), inspector: inspectorName }
          : { status: null, timestamp: "", inspector: "" },
    }));
  }

  function toggleItem(pointLocation: string, item: string) {
    const current = records[keyFor(pointLocation, item)]?.status ?? null;
    setStatus(pointLocation, item, current === "done" ? null : "done");
  }

  function toggleAllDone(pointLocation: string, items: string[]) {
    const allItemsDone = items.every((item) => records[keyFor(pointLocation, item)]?.status === "done");
    for (const item of items) {
      setStatus(pointLocation, item, allItemsDone ? null : "done");
    }
  }

  function closeSkipDialog() {
    setSkipDialogOpen(false);
    setSkipReason("");
    setDeferToTomorrow(null);
  }

  function handleSkip() {
    if (!skipReason.trim()) return;
    if (!isDaily && deferToTomorrow === null) return;
    navigate(`/app/ledger-list/cleaning-record/lines/${lineId}/skip-confirm`, {
      state: { lineName, date, skipReason, inspectorName },
    });
  }

  function goToConfirm() {
    navigate(`/app/ledger-list/cleaning-record/lines/${lineId}/confirm`, {
      state: { lineName, date, records, remarks, inspectorName },
    });
  }

  return (
    <>
      <AppHeader
        title={`清掃記録_${lineName}`}
        action={
          <button
            type="button"
            onClick={() => setSkipDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg text-lg text-[var(--semantic-brand-primary)] shrink-0"
          >
            点検見送り
          </button>
        }
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <DateFilterInput value={date} onChange={setDate} />
          </div>

          {cleaningPoints.map((point, pointIndex) => {
            const allPointDone = point.items.every(
              (item) => records[keyFor(point.location, item)]?.status === "done"
            );
            return (
              <div key={point.id}>
                <div className="flex flex-col items-start rounded-lg overflow-hidden w-full">
                  <div className="bg-[var(--semantic-brand-primary)] flex gap-2 items-center px-4 py-2 w-full">
                    <p className="flex-1 text-lg text-white">{point.location}</p>
                    <button
                      type="button"
                      onClick={() => toggleAllDone(point.location, point.items)}
                      aria-pressed={allPointDone}
                      className={`bg-white h-12 w-40 rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-text-primary)] border transition-all duration-200 ${
                        allPointDone ? "border-[#009944] all-ok-glow" : "border-[#d0d0d0]"
                      }`}
                    >
                      <img
                        src={allPointDone ? iconCheckboxOn : iconCheckbox}
                        alt=""
                        aria-hidden="true"
                        className="size-6 shrink-0"
                      />
                      全て清掃済み
                    </button>
                  </div>
                  <div className="bg-white flex flex-col gap-5 items-start p-4 w-full">
                    {point.items.map((item, itemIndex) => {
                      const record = records[keyFor(point.location, item)];
                      const done = record?.status === "done";
                      return (
                        <div key={item} className="flex flex-col gap-2 items-start w-full">
                          {itemIndex > 0 && <div className="border-t border-[#d0d0d0] w-full -mt-3 mb-1" />}
                          <div className="flex items-center w-full gap-4">
                            <p className="flex-1 text-xl text-[var(--semantic-text-primary)]">{item}</p>
                            <button
                              type="button"
                              onClick={() => toggleItem(point.location, item)}
                              className={`h-12 w-20 rounded-lg flex items-center justify-center text-white shrink-0 ${
                                done ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                              }`}
                            >
                              <img src={iconCheck} alt="完了" className="size-5" />
                            </button>
                          </div>
                          <RecordTimestamp
                            inspector={record?.inspector}
                            timestamp={record?.timestamp}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {pointIndex < cleaningPoints.length - 1 && (
                  <div className="border-t border-[#d0d0d0] w-full mt-5" />
                )}
              </div>
            );
          })}

          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full"
            />
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-34 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
          >
            戻る
          </button>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-43 rounded-lg text-xl text-[var(--semantic-brand-primary)] px-4"
            >
              途中保存
            </button>
            <button
              type="button"
              disabled={!allDone}
              onClick={goToConfirm}
              className={`flex items-center justify-center h-16 w-43 rounded-lg text-xl px-4 ${
                allDone ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-[#d0d0d0] text-white"
              }`}
            >
              確認画面へ
            </button>
          </div>
        </div>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[560px] mx-6">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                途中保存しました
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)] whitespace-nowrap">
                入力内容を途中保存しました。続きは後から入力できます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveDialogOpen(false)}
              className="bg-white border border-[#333] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {skipDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeSkipDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[560px] mx-6">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検を見送りますか？
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                点検を今回は実施せず、点検見送りとして記録します。
              </p>
              {!isDaily && (
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    明日に見送る <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <div className="flex gap-4 items-center">
                    <button
                      type="button"
                      onClick={() => setDeferToTomorrow(true)}
                      className={`h-12 w-34 rounded-lg text-base ${
                        deferToTomorrow === true
                          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      はい
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeferToTomorrow(false)}
                      className={`h-12 w-34 rounded-lg text-base ${
                        deferToTomorrow === false
                          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  備考 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <textarea
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="理由を記入してください。"
                  className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)] placeholder:font-normal"
                />
              </div>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeSkipDialog}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!skipReason.trim() || (!isDaily && deferToTomorrow === null)}
                onClick={handleSkip}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  skipReason.trim() && (isDaily || deferToTomorrow !== null)
                    ? "bg-[var(--semantic-brand-primary)]"
                    : "bg-[#d0d0d0]"
                }`}
              >
                点検を見送る
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
