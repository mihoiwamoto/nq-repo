import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useCleaningRecord } from "./CleaningRecordContext";
import { getFactoryName } from "../../../data/factories";
import { buildMonthGrid, formatDateLabel, formatMonthLabel, WEEKDAY_LABELS } from "./calendarUtils";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

const FREQUENCY_LABEL = { daily: "毎日", weekly: "毎週", monthly: "毎月", yearly: "毎年" } as const;

export function CalendarPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { lines, entries } = useCleaningRecord();
  const navigate = useNavigate();
  const location = useLocation();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/cleaning-record/factories/${factoryId}`;

  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [selectedDateKey, setSelectedDateKey] = useState("2025-04-01");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const state = location.state as { justSaved?: boolean; date?: string } | null;
    if (state?.justSaved) {
      if (state.date) {
        setSelectedDateKey(state.date);
        const [y, m] = state.date.split("-").map(Number);
        setYear(y);
        setMonth(m - 1);
      }
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      navigate(location.pathname, { replace: true });
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const grid = buildMonthGrid(year, month);
  const selectedEntry = entries[selectedDateKey];
  const selectedLines = selectedEntry?.lineIds
    .map((id) => lines.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <div>
      <PageTitleBar
        title="点検予定"
        showBack
        action={
          <Link
            to={`${basePath}/schedule/register?date=${selectedDateKey}`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/cleaning-record" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "点検予定" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>
        <div className="flex gap-6 items-start">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center justify-between w-56">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
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
              <p className="text-lg text-[var(--semantic-text-primary)]">
                {formatMonthLabel(year, month)}
              </p>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
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
            <div className="bg-white border border-[#d0d0d0] rounded-lg overflow-hidden">
              <div className="flex items-center">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`bg-white border border-[#d0d0d0] flex items-center justify-center p-2 size-8 text-sm ${
                      i === 0 ? "text-[var(--semantic-brand-danger)]" : i === 6 ? "text-[#1057f0]" : "text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap w-56">
                {grid.map((cell) => {
                  const isSelected = cell.dateKey === selectedDateKey;
                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                      className="bg-white border border-[#d0d0d0] flex flex-col items-center justify-center p-1 size-8"
                    >
                      <span
                        className={`flex flex-col items-center justify-center rounded-full size-7 text-sm ${
                          isSelected
                            ? "bg-[#fdb045] text-white"
                            : cell.monthOffset !== 0
                              ? "text-[#d0d0d0]"
                              : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col rounded-lg w-[912px] overflow-hidden">
            <div className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex gap-6 items-center px-4 py-3">
              <p className="flex-1 text-base text-[var(--semantic-text-primary)]">
                {formatDateLabel(selectedDateKey)}
              </p>
              <Link
                to={`${basePath}/schedule/register?date=${selectedDateKey}`}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
              >
                ✎ 編集
              </Link>
            </div>
            <div className="flex flex-col px-4 py-2">
              {!selectedLines || selectedLines.length === 0 ? (
                <p className="py-4 text-base text-[var(--semantic-text-secondary)]">
                  登録された点検予定がありません
                </p>
              ) : (
                selectedLines.map((line, i) => (
                  <div key={`${line.id}-${i}`}>
                    <div className="flex gap-4 h-12 items-center">
                      <span className="text-base text-[var(--semantic-text-primary)] w-28">
                        持ち場/ライン名
                      </span>
                      <span className="flex-1 text-base text-[var(--semantic-text-primary)] text-right">
                        【{FREQUENCY_LABEL[line.frequency]}】{line.name}
                      </span>
                    </div>
                    {i < selectedLines.length - 1 && <div className="border-t border-[#d0d0d0]" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-[#19c95f] flex gap-2 items-center px-4 py-3 rounded-lg text-white">
          <span>✓</span>
          <span className="text-xl">更新されました。</span>
          <button type="button" onClick={() => setShowToast(false)} className="ml-2">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
