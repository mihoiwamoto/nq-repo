import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { ledgerCategories } from "../../../data/ledgers";
import { useInspection } from "./InspectionContext";
import { buildMonthGrid, formatDateLabel, isClosedDay, toDateKey } from "./calendarUtils";
import { useSensorySchedule } from "../sensory-inspection/ScheduleContext";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const todayKey = toDateKey(2025, 3, 3);
const equipmentInspectionIcon = ledgerCategories.find(
  (category) => category.slug === "equipment-inspection"
)?.appIcon;
const sensoryInspectionIcon = ledgerCategories.find(
  (category) => category.slug === "sensory-inspection"
)?.appIcon;

type SchedulableLedger = {
  slug: string;
  icon?: string;
  label: string;
  hasEntry: boolean;
  targetPath: string;
};

export function SchedulePage() {
  const navigate = useNavigate();
  const { entries } = useInspection();
  const { entries: sensoryEntries } = useSensorySchedule();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3); // 0-indexed: April
  const [selectedDateKey, setSelectedDateKey] = useState("2025-04-01");
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [alreadyRegisteredOpen, setAlreadyRegisteredOpen] = useState(false);
  const [unavailableOpen, setUnavailableOpen] = useState(false);

  const cells = buildMonthGrid(year, month);
  const selectedClosed = isClosedDay(selectedDateKey);

  function ledgersForDate(dateKey: string): SchedulableLedger[] {
    const equipmentEntry = entries[dateKey];
    const sensoryEntry = sensoryEntries[dateKey];
    return [
      {
        slug: "equipment-inspection",
        icon: equipmentInspectionIcon,
        label: "機械器具点検 点検管理",
        hasEntry: !!equipmentEntry && equipmentEntry.lineIds.length > 0,
        targetPath: `/app/schedule/equipment-inspection/${dateKey}`,
      },
      {
        slug: "sensory-inspection",
        icon: sensoryInspectionIcon,
        label: "官能検査記録 検査商品設定",
        hasEntry: !!sensoryEntry && sensoryEntry.products.length > 0,
        targetPath: `/app/schedule/sensory-inspection/${dateKey}`,
      },
    ];
  }

  const selectedLedgers = ledgersForDate(selectedDateKey);
  const registeredLedgers = selectedLedgers.filter((ledger) => ledger.hasEntry);

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function openRegisterDialog() {
    if (selectedLedgers.length === 0) {
      setUnavailableOpen(true);
      return;
    }
    setRegisterDialogOpen(true);
  }

  function chooseLedger(ledger: SchedulableLedger) {
    setRegisterDialogOpen(false);
    if (ledger.hasEntry) {
      setAlreadyRegisteredOpen(true);
      return;
    }
    navigate(ledger.targetPath);
  }

  return (
    <>
      <AppHeader title="点検予定" />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-6 items-start">
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="前の月"
              className="bg-white border border-[var(--semantic-brand-primary)] size-10 rounded-lg flex items-center justify-center shrink-0"
            >
              <span
                aria-hidden
                className="inline-block size-6 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconArrowLeft}")`,
                  maskImage: `url("${iconArrowLeft}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            </button>
            <p className="text-xl text-[var(--semantic-text-primary)] text-center">
              {year}年{month + 1}月
            </p>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="次の月"
              className="bg-white border border-[var(--semantic-brand-primary)] size-10 rounded-lg flex items-center justify-center shrink-0"
            >
              <span
                aria-hidden
                className="inline-block size-6 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconArrowRight}")`,
                  maskImage: `url("${iconArrowRight}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            </button>
          </div>

          <div className="bg-white border border-[#d0d0d0] flex flex-col items-start overflow-hidden rounded-lg w-full">
            <div className="flex items-center w-full">
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`bg-white border border-[#d0d0d0] flex-1 h-8 flex items-center justify-center p-2 text-base ${
                    i === 0
                      ? "text-[var(--semantic-brand-danger)]"
                      : i === 6
                        ? "text-[#1057f0]"
                        : "text-[var(--semantic-text-primary)]"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap w-full">
              {cells.map((cell) => {
                const closed = isClosedDay(cell.dateKey) && cell.monthOffset === 0;
                const cellLedgers = ledgersForDate(cell.dateKey).filter((l) => l.hasEntry);
                const isSelected = cell.dateKey === selectedDateKey;
                const isToday = cell.dateKey === todayKey;
                const weekday = new Date(cell.dateKey).getDay();
                const dayColor =
                  cell.monthOffset !== 0
                    ? "text-[#d0d0d0]"
                    : weekday === 0
                      ? "text-[var(--semantic-brand-danger)]"
                      : weekday === 6
                        ? "text-[#1057f0]"
                        : "text-[var(--semantic-text-primary)]";
                return (
                  <button
                    key={`${cell.monthOffset}-${cell.day}`}
                    type="button"
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={`border border-[#d0d0d0] flex flex-col items-end gap-1 h-24 p-1 shrink-0 overflow-hidden ${
                      closed ? "bg-[#e4e4e4]" : "bg-white"
                    }`}
                    style={{ width: "14.2857%" }}
                  >
                    <span
                      className={`size-7 shrink-0 rounded-full flex items-center justify-center p-0.5 text-lg ${
                        isSelected
                          ? "bg-[#fdb045] text-white"
                          : isToday
                            ? "border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                            : dayColor
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="flex flex-col gap-1 items-start w-full min-h-0 flex-1 overflow-hidden">
                      {closed && (
                        <span className="flex items-center justify-center p-1 rounded w-full text-sm text-[var(--semantic-text-primary)]">
                          休業日
                        </span>
                      )}
                      {cellLedgers.map((ledger) => (
                        <span
                          key={ledger.slug}
                          className="bg-white drop-shadow-[0px_2px_2px_rgba(51,51,51,0.24)] rounded flex items-center gap-0.5 p-1 w-full shrink-0"
                        >
                          {ledger.icon && (
                            <img src={ledger.icon} alt="" className="size-4 shrink-0" />
                          )}
                          <span className="flex-1 min-w-0 text-xs text-left text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                            {ledger.label}
                          </span>
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white flex flex-col flex-1 min-h-0 items-center overflow-hidden rounded-lg w-full">
          <div className="bg-white drop-shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex items-center justify-between px-4 py-3 rounded-t-lg shrink-0 w-full">
            <p className="text-xl text-[var(--semantic-text-primary)] flex items-center gap-2">
              {formatDateLabel(selectedDateKey)}
              {selectedClosed && (
                <span className="text-base text-[var(--semantic-brand-danger)]">休業日</span>
              )}
            </p>
            {!selectedClosed && (
              <button
                type="button"
                onClick={openRegisterDialog}
                className="bg-[var(--semantic-brand-primary)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-base text-white shrink-0"
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
                    backgroundColor: "#ffffff",
                  }}
                />
                新規登録
              </button>
            )}
          </div>
          <div className="flex flex-col flex-1 min-h-0 items-center overflow-y-auto px-4 pb-10 w-full">
            {!selectedClosed &&
              registeredLedgers.map((ledger) => (
                <div key={ledger.slug} className="w-full">
                  <Link
                    to={ledger.targetPath}
                    className="flex flex-col items-start justify-center px-2 py-4 w-full"
                  >
                    <span className="flex items-center gap-2 w-full">
                      {ledger.icon && <img src={ledger.icon} alt="" className="size-6 shrink-0" />}
                      <span className="flex-1 min-w-0 text-lg text-[var(--semantic-text-primary)]">
                        {ledger.label}
                      </span>
                    </span>
                  </Link>
                  <div className="h-px w-full bg-[#d0d0d0]" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {registerDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRegisterDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-[520px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">新規登録</h2>
            {selectedLedgers.map((ledger) => (
              <button
                key={ledger.slug}
                type="button"
                onClick={() => chooseLedger(ledger)}
                className="bg-white border border-[#d0d0d0] flex items-center gap-2 h-14 px-4 rounded-lg w-full text-left"
              >
                {ledger.icon && <img src={ledger.icon} alt="" className="size-5" />}
                <span className="text-base text-[var(--semantic-text-primary)]">{ledger.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRegisterDialogOpen(false)}
              className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-40 rounded-lg text-base text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {alreadyRegisteredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAlreadyRegisteredOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-[520px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">新規登録</h2>
            <p className="text-base text-[var(--semantic-text-primary)] text-center">
              すでに点検予定が登録されているため新規登録できません。詳細画面の「編集」から登録内容を変更できます。
            </p>
            <button
              type="button"
              onClick={() => setAlreadyRegisteredOpen(false)}
              className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-40 rounded-lg text-base text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {unavailableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setUnavailableOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-[520px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">新規登録</h2>
            <p className="text-base text-[var(--semantic-text-primary)] text-center">
              点検予定に使用する帳票が設定されていないため、新規登録できません。管理画面より帳票を設定してから、再度登録してください。
            </p>
            <button
              type="button"
              onClick={() => setUnavailableOpen(false)}
              className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-40 rounded-lg text-base text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
