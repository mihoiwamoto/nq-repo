import { useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { LineProgressPanel } from "./LineProgressPanel";
import { LINE_STATUS_COLORS, LINE_STATUS_LABELS, type Frequency } from "./mockData";
import { useInspection } from "./InspectionContext";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";

const FREQUENCY_TABS: { key: Frequency; label: string }[] = [
  { key: "daily", label: "毎日" },
  { key: "weekly", label: "毎週" },
  { key: "monthly", label: "毎月" },
  { key: "yearly", label: "毎年" },
];

export function LineSelectionPage() {
  const { lines } = useInspection();
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [progressOpen, setProgressOpen] = useState(false);

  const visibleLines = lines.filter((line) => line.frequency === frequency);
  const inspectedCount = visibleLines.filter((line) => line.status === "inspected").length;
  const inspectedLines = lines.filter((line) => line.status === "inspected");

  return (
    <>
      <AppHeader
        title="機械器具点検"
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
                {inspectedCount}/{visibleLines.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center">
        <div className="bg-white flex h-10 items-center rounded-lg w-full max-w-full max-w-[480px] mx-40">
          {FREQUENCY_TABS.map((tab) => {
            const count = lines.filter(
              (line) =>
                line.frequency === tab.key &&
                (line.status === "not_inspected" || line.status === "in_progress")
            ).length;
            const active = tab.key === frequency;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFrequency(tab.key)}
                className={`relative flex-1 h-10 rounded-lg text-lg ${
                  active ? "bg-[var(--semantic-brand-primary)] text-white" : "text-[var(--semantic-text-secondary)]"
                }`}
              >
                {tab.label}
                {!active && (
                  <span className="absolute -top-1.5 right-4 bg-[var(--semantic-brand-danger)] text-white text-[10px] rounded-full size-4 flex items-center justify-center">
                    {String(count).padStart(2, "0")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
          {visibleLines.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">
              対象のライン/持ち場はありません
            </p>
          ) : (
            visibleLines.map((line) => (
              <Link
                key={line.id}
                to={`/app/ledger-list/equipment-inspection/lines/${line.id}`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full"
              >
                <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{line.name}</p>
                <span
                  className="flex h-8 w-20 items-center justify-center rounded-lg text-sm text-white shrink-0"
                  style={{ backgroundColor: LINE_STATUS_COLORS[line.status] }}
                >
                  {LINE_STATUS_LABELS[line.status]}
                </span>
              </Link>
            ))
          )}
        </div>

        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex h-16 items-center justify-center px-4 py-2 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>

      {progressOpen && <LineProgressPanel lines={lines} inspectedLines={inspectedLines} onClose={() => setProgressOpen(false)} />}
    </>
  );
}
