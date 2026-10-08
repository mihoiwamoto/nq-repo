import { Fragment, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { DateFilterInput } from "../../components/DateFilterInput";
import { recordTimestamp, todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { AppHeader } from "../../layout/AppHeader";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import { useCleaningRecord } from "./CleaningRecordContext";
import {
  ACTORS,
  cleaningPoints,
  FREQUENCY_LABELS,
  initialRecords,
  initialRemarks,
  pendingReviewRecords,
  skippedRemarks,
  skippedReviewRemarks,
  type CleaningItemRecord,
} from "./mockData";
import iconCheckbox from "@images/Icon/ckeckbox.svg";
import iconCheckboxOn from "@images/Icon/ckeckbox_on.svg";

/** 確認待ち（差し戻し）・進捗一覧の見本の記録の実施日。確認待ちの詳細の「実施日 2025/04/01」と同じ */
const REVIEW_RECORD_DATE = "2025-04-01";

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
function seedRecords(fill: RecordFill, reviewRecord = false): Record<string, CleaningItemRecord> {
  // 確認待ち（差し戻し）・進捗一覧の記録は 2025/04/01 の記録（確定デザイン 7139:229303・7139:228907）
  const entries = fillSlice(orderedRecordKeys(), fill)
    .map((key) => [key, reviewRecord ? pendingReviewRecords[key] : initialRecords[key] ?? pendingReviewRecords[key]] as const)
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
  const stateData = location.state as
    | { inspectorName?: string; editReturn?: { to: string; state?: unknown }; skipped?: boolean }
    | null;
  const inspectorName = stateData?.inspectorName ?? ACTORS[0].name;
  // 確認待ちの差し戻しから「点検内容を修正する」で来たときの戻り先（機械器具点検と同じ）。
  // このときは提出フローではなく、編集を保存して元の詳細画面に戻すだけにする。
  const editReturn = stateData?.editReturn;

  const line = lines.find((l) => l.id === lineId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const lineFill: RecordFill =
    line?.status === "not_inspected" || line?.status === "skipped"
      ? "none"
      : line?.status === "in_progress"
        ? "partial"
        : "full";
  // 見送った記録の差し戻しを直すときは、清掃していない状態（全項目未選択・備考に見送り理由）で開く
  // （機械器具点検と同じ。確定デザイン 7139:228907）
  const reviewSkipped = !!editReturn && (stateData?.skipped ?? false);
  // 差し戻しの編集は「提出済みの記録を直す」ので、記録は入り切った状態で開く
  const fill = progressFill ?? (editReturn ? (reviewSkipped ? "none" : "full") : lineFill);
  const hasStarted = fill !== "none";
  // 見送りのラインは清掃自体を行っていないので、記録は空・備考に見送り理由だけを表示する
  const isSkipped = reviewSkipped || (progressFill === null && line?.status === "skipped");
  const fromProgress = useFromProgress();
  // 差し戻し・進捗一覧から開く記録は提出済み（確認待ち・進捗一覧の見本は 04/01）の記録なので、実施日は元の記録の日のまま
  // （確定デザイン 7139:228907・7139:229303 の 2025/04/01。機械器具点検の REVIEW_RECORD_DATE と同じ）
  const reviewRecord = !!editReturn || (fromProgress && progressFill !== null && progressFill !== "none");

  const [date, setDate] = useState(() =>
    reviewRecord ? REVIEW_RECORD_DATE : hasStarted ? line?.inspectionDate || todayString() : todayString(),
  );
  const [records, setRecords] = useState<Record<string, CleaningItemRecord>>(() =>
    isSkipped ? {} : seedRecords(fill, reviewRecord),
  );
  const [remarks, setRemarks] = useState(() =>
    reviewSkipped ? skippedReviewRemarks : isSkipped ? skippedRemarks : hasStarted ? initialRemarks : "",
  );
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [deferToTomorrow, setDeferToTomorrow] = useState<boolean | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const lineName = line?.name ?? "ゆばライン";
  const isDaily = (line?.frequency ?? "daily") === "daily";
  // 見出しのライン名。帳票一覧から来たときは名前だけ、進捗一覧・差し戻しから来たときは頻度を頭に付ける
  // （確定デザイン 7139:221756 と 7139:229303 / 7139:228907）
  const lineTitle =
    fromProgress || editReturn ? `【${FREQUENCY_LABELS[line?.frequency ?? "daily"]}】${lineName}` : lineName;
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

  // 差し戻しの編集で見送るときは「明日に見送る」を出さず、備考は今の備考（見送った記録なら前回の見送り理由）を引き継ぐ
  // （確定デザイン 7139:228938 の注記）
  function openSkipDialog() {
    if (editReturn) setSkipReason(remarks.replace(/^(点検)?見送り\n/, ""));
    setSkipDialogOpen(true);
  }

  function closeSkipDialog() {
    setSkipDialogOpen(false);
    setSkipReason("");
    setDeferToTomorrow(null);
  }

  function handleSkip() {
    if (!skipReason.trim()) return;
    // 差し戻しの編集で見送ったときも見送りの確認画面へ進み、そこで「編集を保存」を押すと確認待ちの詳細へ戻る
    // （確定デザイン 7139:229587。2026-10-08 ユーザー指定。機械器具点検と同じ）
    if (!editReturn && !isDaily && deferToTomorrow === null) return;
    navigate(`/app/ledger-list/cleaning-record/lines/${lineId}/skip-confirm`, {
      state: {
        lineName,
        lineTitle,
        date,
        skipReason,
        inspectorName,
        deferToTomorrow: isDaily || editReturn ? undefined : deferToTomorrow ?? undefined,
        editReturn,
      },
    });
  }

  function goToConfirm() {
    navigate(`/app/ledger-list/cleaning-record/lines/${lineId}/confirm`, {
      state: { lineName, lineTitle, date, records, remarks, inspectorName },
    });
  }

  return (
    <>
      <AppHeader
        title={`清掃記録_${lineTitle}`}
        action={
          <button
            type="button"
            onClick={openSkipDialog}
            // 確定デザイン（7139:221756）：144×48
            className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-36 rounded-lg text-lg text-[var(--semantic-brand-primary)] shrink-0"
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
            {/* 確定デザイン（7139:221756）：実施日の欄は枠線なし。下に区切り線 */}
            <DateFilterInput value={date} onChange={setDate} variant="borderless" />
          </div>

          <div className="border-t border-[#d0d0d0] w-full" />

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
                      // 確定デザイン（7139:221652）：押したあともチェックが付くだけで、白地・灰色の枠のまま光らせない（機械器具点検の「全て異常なし」と同じ。2026-10-07）
                      className="bg-white h-12 w-40 rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-text-primary)] border border-[#d0d0d0]"
                    >
                      <img
                        src={allPointDone ? iconCheckboxOn : iconCheckbox}
                        alt=""
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                      全て清掃済み
                    </button>
                  </div>
                  {/* 確定デザイン（7139:221756）：項目どうしは区切り線の上下 20px（間隔 88、実施者・時刻の行があるとき 110） */}
                  <div className="bg-white flex flex-col gap-5 items-start p-4 w-full">
                    {point.items.map((item, itemIndex) => {
                      const record = records[keyFor(point.location, item)];
                      const done = record?.status === "done";
                      return (
                        <Fragment key={item}>
                        {itemIndex > 0 && <div className="border-t border-[#d0d0d0] w-full" />}
                        <div className="flex flex-col gap-2 items-start w-full">
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
                        </Fragment>
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
            {/* 確定デザイン（InputLongTextItem）：高さ 82・14px の Regular */}
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="補足事項や連絡事項があればご記入ください。"
              className="bg-white h-[82px] p-2 rounded-lg text-sm font-normal leading-[1.6] text-[var(--semantic-text-primary)] w-full resize-none placeholder:text-[var(--semantic-text-secondary)]"
            />
          </div>
        </div>

        {editReturn ? (
          /* 差し戻しの編集モード。提出はせず、「編集を保存」で確認待ち詳細の元のステップに戻る */
          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => navigate(editReturn.to, { state: editReturn.state })}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={!allDone}
              onClick={() => navigate(editReturn.to, { state: editReturn.state })}
              className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl px-4 ${
                allDone ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-[#d0d0d0] text-white"
              }`}
            >
              編集を保存
            </button>
          </div>
        ) : (
        /* 確定デザイン（BottomActionBar02）：高さ 112（上下 24px） */
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-between">
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
        )}
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[calc(100%-32px)]">
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[calc(100%-32px)]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検を見送りますか？
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                点検を今回は実施せず、点検見送りとして記録します。
              </p>
              {!isDaily && !editReturn && (
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
                  // 確定デザイン（7139:228938）：高さ 82・14px の Regular
                  className="bg-white h-[82px] p-2 rounded-lg text-sm font-normal leading-[1.6] text-[var(--semantic-text-primary)] w-full resize-none placeholder:text-[var(--semantic-text-secondary)]"
                />
              </div>
            </div>
            {/* 確定デザイン（7139:228938）：ボタンの間 40px */}
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeSkipDialog}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!skipReason.trim() || (!isDaily && !editReturn && deferToTomorrow === null)}
                onClick={handleSkip}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  skipReason.trim() && (isDaily || !!editReturn || deferToTomorrow !== null)
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
