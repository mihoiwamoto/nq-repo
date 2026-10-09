import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { todayString } from "../../utils/date";
import { stampTimestamps, seedTimestamp } from "../../utils/recordTimestamps";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { PulldownSelect } from "../../components/PulldownSelect";
import { ACTORS } from "../cleaning-record/mockData";
import { useSensoryInspection } from "./SensoryInspectionContext";
import {
  CRITERIA,
  pendingReviewScoreRows,
  products,
  type ComparisonDateType,
  type ComparisonOption,
  type Criterion,
  type CriterionRecord,
  type SensoryRecord,
} from "./mockData";
import { findFactoryItem } from "../../data/factoryAppData";
import { tplId } from "../../data/targetId";
import { useSensorySchedule } from "./ScheduleContext";
import { adminSensoryPlanFor } from "../../../admin/features/sensory-inspection/sharedSchedule";
import type { ScheduledProduct, SensoryScheduleEntry } from "./mockData";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";

/** 点検予定（検査製品設定）でこの製品を登録したもの。実施日の予定を優先し、無ければいちばん新しい予定 */
function plannedFor(
  entries: Record<string, SensoryScheduleEntry>,
  productId: string | undefined,
  date: string
): ScheduledProduct | undefined {
  if (!productId) return undefined;
  const id = tplId(productId);
  const hit = (dateKey: string) => entries[dateKey]?.products.find((p) => p.productId === id);
  return (
    hit(date) ??
    Object.keys(entries)
      .sort()
      .reverse()
      .map(hit)
      .find(Boolean)
  );
}

/** 管理画面の点検予定（比較製品・比較製品の日付の種類と日付・製造日）を、アプリの点検予定と同じ形にする */
function fromAdminPlan(productId: string, name: string, date: string): ScheduledProduct | undefined {
  const plan = adminSensoryPlanFor(name, date);
  if (!plan) return undefined;
  return {
    productId,
    manufactureDate: plan.productManufacturedAt ?? "",
    comparison: plan.isComparison === 1 ? "present" : plan.isComparison === 0 ? "none" : "unset",
    comparisonDateType: plan.isComparison === 1 ? plan.dateType : undefined,
    comparisonManufactureDate: plan.dateType === "manufactured" ? (plan.manufacturedAt ?? "") : "",
    comparisonBestBeforeDate: plan.dateType === "bestBefore" ? (plan.bestBeforeAt ?? "") : "",
  };
}

/** 点検予定から入る値は触れない灰色の欄で出す（日付の欄と同じ大きさ） */
function LockedDate({ value }: { value: string }) {
  return (
    <div className="bg-[#d0d0d0] flex gap-2 h-12 items-center justify-end px-4 rounded-lg w-[200px] shrink-0">
      <p className="flex-1 min-w-0 text-base text-[var(--semantic-text-primary)]">
        {value ? value.replaceAll("-", "/") : "未設定"}
      </p>
      <img src={iconCalendar} alt="" aria-hidden className="size-6 shrink-0" />
    </div>
  );
}

const EMPTY_SCORES: Record<Criterion, CriterionRecord | null> = {
  味: null,
  形: null,
  色: null,
  食感: null,
  香り: null,
  とろみ: null,
};

/** 点検中は前半の評価項目だけ点数が入った「記録途中」の状態にする */
function seedScores(fill: RecordFill): Record<Criterion, CriterionRecord | null> {
  const source = pendingReviewScoreRows[0].scores;
  const scored = new Set(fillSlice([...CRITERIA], fill));
  return Object.fromEntries(
    CRITERIA.map((criterion) => [criterion, scored.has(criterion) ? source[criterion] : null]),
  ) as Record<Criterion, CriterionRecord | null>;
}

function scoreButtonColor(value: number, selected: number | undefined) {
  if (selected !== value) return "bg-[#d0d0d0]";
  return value <= 2 ? "bg-[#f85c5c]" : "bg-[#19c95f]";
}

function NumberButtons({
  criterion,
  selected,
  onSelect,
}: {
  criterion: Criterion;
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="flex gap-4 items-center shrink-0">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`size-12 rounded-lg flex items-center justify-center text-base text-white ${scoreButtonColor(
            value,
            selected
          )}`}
          aria-label={`${criterion} ${value}点`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export function RecordPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { recordsByProduct } = useSensoryInspection();

  const product = findFactoryItem(products, productId);
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const existing = productId ? recordsByProduct[productId] : null;

  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const productFill: RecordFill = product?.status === "inspected" ? "full" : "none";
  const fill = progressFill ?? productFill;
  // この画面で登録済みのものがあればそれを、無ければステータスに応じた初期状態を出す
  const seeded: SensoryRecord | null =
    existing ??
    (fill === "none"
      ? null
      : {
          date: product?.date || todayString(),
          manufactureDate: pendingReviewScoreRows[0].manufactureDate,
          comparison: pendingReviewScoreRows[0].comparison,
          comparisonManufactureDate: pendingReviewScoreRows[0].comparisonManufactureDate,
          comparisonDateType: "manufactured",
          scores: seedScores(fill),
        });

  const [date, setDate] = useState(seeded?.date ?? todayString());

  // 製造日・比較製品・比較製品の日付は、点検予定（検査製品設定）で登録したものを出す（2026-10-09）。
  // 製造日は触れない。比較製品の日付は、予定に日付があればその種類（製造日／賞味期限）と日付を触れない欄で出す
  const { entries: scheduleEntries } = useSensorySchedule();
  // 管理画面の点検予定で登録したものを優先し、無ければアプリの点検予定
  const [planned] = useState(() => {
    const day = seeded?.date ?? todayString();
    return (
      (productId && product ? fromAdminPlan(productId, product.name, day) : undefined) ??
      plannedFor(scheduleEntries, productId, day)
    );
  });
  // 予定で選んだ比較製品の日付の種類（製造日／賞味期限）。種類を持たない予定は入っている日付から決める
  const plannedDateType: ComparisonDateType | null =
    planned?.comparisonDateType ??
    (planned?.comparisonBestBeforeDate ? "bestBefore" : planned?.comparisonManufactureDate ? "manufactured" : null);
  const plannedComparison: ComparisonOption | null =
    planned?.comparison === "present" || planned?.comparison === "none" ? planned.comparison : null;

  const [manufactureDate] = useState(planned?.manufactureDate || seeded?.manufactureDate || "");
  const [comparison, setComparison] = useState<ComparisonOption | null>(plannedComparison ?? seeded?.comparison ?? null);
  const [comparisonManufactureDate, setComparisonManufactureDate] = useState(
    // 未点検は空で開く（以前は見本の日付が入っていた。2026-10-09）
    plannedDateType ? (planned?.comparisonManufactureDate ?? "") : (seeded?.comparisonManufactureDate ?? "")
  );
  // 比較製品の日付の種類（製造日／賞味期限）。見本の記録は種類を持たないので、日付が入っていれば製造日
  const [comparisonDateType, setComparisonDateType] = useState<ComparisonDateType | null>(
    plannedDateType ??
      seeded?.comparisonDateType ??
      (seeded?.comparisonBestBeforeDate ? "bestBefore" : seeded?.comparisonManufactureDate ? "manufactured" : null)
  );
  const [comparisonBestBeforeDate, setComparisonBestBeforeDate] = useState(
    plannedDateType ? (planned?.comparisonBestBeforeDate ?? "") : (seeded?.comparisonBestBeforeDate ?? "")
  );
  /** 予定で種類が決まっていれば、見出しは「比較製品製造日」か「比較製品賞味期限」。日付は予定のものが入り、ここで変えられる */
  const comparisonTypeFixed = !!plannedDateType && comparison === "present";
  const [scores, setScores] = useState<Record<Criterion, CriterionRecord | null>>(
    seeded?.scores ?? EMPTY_SCORES
  );

  /** 項目ごとに「いつ入力したか」を持たせ、入力欄の下に実施者名と並べて出す。
   *  点検済み・記録途中で開いたときは、すでに入っている項目に実施日を出しておく */
  const [timestamps, setTimestamps] = useState<Record<string, string>>(() =>
    seeded
      ? Object.fromEntries(
          [
            ["manufactureDate", seeded.manufactureDate],
            ["comparison", seeded.comparison],
            ["comparisonDateType", seeded.comparisonManufactureDate || seeded.comparisonBestBeforeDate],
            ["comparisonManufactureDate", seeded.comparisonManufactureDate],
            ["comparisonBestBeforeDate", seeded.comparisonBestBeforeDate],
            ...CRITERIA.map((c) => [c, seeded.scores[c]]),
          ]
            .filter(([, value]) => value)
            .map(([key]) => [key as string, seedTimestamp(seeded.date)])
        )
      : {}
  );

  /** 値が入っていれば入力時刻を打ち、消して未記録に戻したら時刻表示も消す */
  function stamp(field: string, value: unknown) {
    setTimestamps((prev) => stampTimestamps(prev, field, value));
  }

  const [dialogCriterion, setDialogCriterion] = useState<Criterion | null>(null);
  const [dialogScore, setDialogScore] = useState<number | null>(null);
  const [dialogReason, setDialogReason] = useState("");

  if (!product) {
    return (
      <>
        <AppHeader title="官能検査記録" />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">対象の製品が見つかりません。</p>
        </div>
      </>
    );
  }

  function handleScoreClick(criterion: Criterion, value: number) {
    if (value >= 3) {
      setScores((prev) => ({
        ...prev,
        [criterion]: { score: value, reason: "" },
      }));
      stamp(criterion, value);
    } else {
      setDialogCriterion(criterion);
      setDialogScore(value);
      setDialogReason(scores[criterion]?.reason ?? "");
    }
  }

  function closeDialog() {
    setDialogCriterion(null);
    setDialogScore(null);
    setDialogReason("");
  }

  function confirmDialog() {
    if (!dialogCriterion || dialogScore === null) return;
    setScores((prev) => ({
      ...prev,
      [dialogCriterion]: { score: dialogScore, reason: dialogScore <= 2 ? dialogReason : "" },
    }));
    stamp(dialogCriterion, dialogScore);
    closeDialog();
  }

  const canProceed =
    date !== "" &&
    // 製造日は点検予定から入るだけで、ここでは入れられないので条件にしない
    comparison !== null &&
    (comparison === "none" ||
      (comparisonDateType === "bestBefore" ? comparisonBestBeforeDate !== "" : comparisonDateType === "manufactured" && comparisonManufactureDate !== "")) &&
    CRITERIA.every((c) => scores[c] !== null);

  function handleNext() {
    if (!canProceed || !productId) return;
    navigate(`/app/ledger-list/sensory-inspection/products/${productId}/confirm`, {
      state: {
        inspectorName,
        record: {
          date,
          manufactureDate,
          comparison,
          comparisonDateType: comparison === "present" ? (comparisonDateType ?? undefined) : undefined,
          comparisonManufactureDate:
            comparison === "present" && comparisonDateType === "manufactured" ? comparisonManufactureDate : "",
          comparisonBestBeforeDate:
            comparison === "present" && comparisonDateType === "bestBefore" ? comparisonBestBeforeDate : "",
          scores,
          timestamps,
        },
      },
    });
  }

  // 本番の API は各項目の備考（note）を任意で持つ（openapi:7475 など）。空でも「完了」を押せる（2026-10-08）
  const dialogConfirmDisabled = dialogScore === null;

  return (
    <>
      <AppHeader title="官能検査記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
        <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full max-w-full">
          <div className="flex gap-2 items-center">
            <span className="text-base text-[#808080] w-[90px]">検査製品名</span>
            <span className="text-base text-[var(--semantic-text-primary)]">{product.name}</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-base text-[#808080] w-[90px]">賞味期限</span>
            <span className="text-base text-[var(--semantic-text-primary)]">
              {product.expiryDate.replaceAll("-", "/")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 items-start w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <DateFilterInput value={date} onChange={setDate} />
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                製造日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              {/* 点検予定で登録した製造日。ここでは変えられない */}
              <LockedDate value={manufactureDate} />
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                比較製品 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <PulldownSelect
                value={comparison}
                onChange={(v) => {
                  setComparison(v);
                  stamp("comparison", v);
                }}
                options={[
                  { value: "none", label: "比較製品なし" },
                  { value: "present", label: "比較製品あり" },
                ]}
              />
            </div>
            <RecordTimestamp inspector={inspectorName} timestamp={timestamps.comparison} />
          </div>

          {comparisonTypeFixed && (
            <>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  {/* 点検予定で選んだ種類の見出し（比較製品製造日／比較製品賞味期限）。日付は予定のものが入った状態で、ここで変えられる */}
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    {comparisonDateType === "bestBefore" ? "比較製品賞味期限" : "比較製品製造日"}
                    <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <DateFilterInput
                      value={comparisonDateType === "bestBefore" ? comparisonBestBeforeDate : comparisonManufactureDate}
                      onChange={(v) => {
                        if (comparisonDateType === "bestBefore") {
                          setComparisonBestBeforeDate(v);
                          stamp("comparisonBestBeforeDate", v);
                        } else {
                          setComparisonManufactureDate(v);
                          stamp("comparisonManufactureDate", v);
                        }
                      }}
                    />
                </div>
                <RecordTimestamp
                  inspector={inspectorName}
                  timestamp={
                    comparisonDateType === "bestBefore"
                      ? timestamps.comparisonBestBeforeDate
                      : timestamps.comparisonManufactureDate
                  }
                />
              </div>
            </>
          )}
          {comparison === "present" && !comparisonTypeFixed && (
            <>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  {/* 管理画面の点検予定と同じく、比較製品の日付は 製造日／賞味期限 をプルダウンで選んでから日付を入れる */}
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    比較製品の日付 <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <div className="flex gap-2 items-center">
                    <PulldownSelect
                      value={comparisonDateType}
                      onChange={(v) => {
                        // 種類を切り替えても選んだ日付は引き継ぐ
                        const carried = comparisonDateType === "bestBefore" ? comparisonBestBeforeDate : comparisonManufactureDate;
                        setComparisonDateType(v);
                        setComparisonManufactureDate(v === "manufactured" ? carried : "");
                        setComparisonBestBeforeDate(v === "bestBefore" ? carried : "");
                        stamp("comparisonDateType", v);
                      }}
                      options={[
                        { value: "manufactured", label: "製造日" },
                        { value: "bestBefore", label: "賞味期限" },
                      ]}
                      widthClassName="w-[200px]"
                    />
                    {comparisonDateType && (
                      <DateFilterInput
                        value={comparisonDateType === "bestBefore" ? comparisonBestBeforeDate : comparisonManufactureDate}
                        onChange={(v) => {
                          if (comparisonDateType === "bestBefore") {
                            setComparisonBestBeforeDate(v);
                            stamp("comparisonBestBeforeDate", v);
                          } else {
                            setComparisonManufactureDate(v);
                            stamp("comparisonManufactureDate", v);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                <RecordTimestamp
                  inspector={inspectorName}
                  timestamp={
                    comparisonDateType === "bestBefore"
                      ? timestamps.comparisonBestBeforeDate
                      : comparisonDateType === "manufactured"
                        ? timestamps.comparisonManufactureDate
                        : timestamps.comparisonDateType
                  }
                />
              </div>
            </>
          )}
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="bg-[#ddf3e7] flex flex-col p-2 rounded-lg w-full text-[var(--semantic-text-primary)]">
            <p className="text-base">【点数の評価基準】</p>
            <p className="text-sm leading-[1.6]">　5点・・・標準品と同等の品位が保たれている</p>
            <p className="text-sm leading-[1.6]">　4点・・・標準品よりやや劣るが遜色ない品位が保たれている</p>
            <p className="text-sm leading-[1.6]">　3点・・・標準品より劣るが製品として必要な品位が保たれている</p>
            <p className="text-sm leading-[1.6]">　2点・・・標準品よりかなり劣り製品として不向き</p>
            <p className="text-sm leading-[1.6]">　1点・・・標準品より著しく劣り製品としての品位が失われている</p>
          </div>

          {CRITERIA.map((criterion, index) => (
            <div key={criterion} className="flex flex-col gap-2 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  {criterion} <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <NumberButtons
                  criterion={criterion}
                  selected={scores[criterion]?.score}
                  onSelect={(value) => handleScoreClick(criterion, value)}
                />
              </div>
              {scores[criterion] && scores[criterion]!.score <= 2 && scores[criterion]!.reason.trim() !== "" && (
                <p className="text-base text-[#808080] px-2">備考：{scores[criterion]!.reason}</p>
              )}
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps[criterion]} />
              {index < CRITERIA.length - 1 && <div className="border-t border-[#d0d0d0] w-full" />}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={handleNext}
          className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
            canProceed ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          確認画面へ
        </button>
      </div>

      {dialogCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-4 py-10 w-full max-w-full mx-40 mx-16 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">点検箇所</h2>
              <div className="flex flex-col gap-6 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    {dialogCriterion} <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <NumberButtons
                    criterion={dialogCriterion}
                    selected={dialogScore ?? undefined}
                    onSelect={setDialogScore}
                  />
                </div>
                {dialogScore !== null && dialogScore <= 2 && (
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      備考
                    </p>
                    <textarea
                      value={dialogReason}
                      onChange={(e) => setDialogReason(e.target.value)}
                      placeholder="備考を記入してください。"
                      className="bg-white p-2 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] placeholder:font-normal w-full h-[82px] resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeDialog}
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={dialogConfirmDisabled}
                onClick={confirmDialog}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  dialogConfirmDisabled ? "bg-[#d0d0d0]" : "bg-[var(--semantic-brand-primary)]"
                }`}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
