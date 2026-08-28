import { useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { POINT_STATUS_COLORS, POINT_STATUS_LABELS } from "./mockData";
import { useWaterInspection } from "./WaterInspectionContext";
import { ProgressPanel } from "./ProgressPanel";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";

export function PointSelectionPage() {
  const { points } = useWaterInspection();
  const [progressOpen, setProgressOpen] = useState(false);
  const inspectedCount = points.filter((point) => point.status !== "not_inspected").length;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <AppHeader
        title="使用水の点検"
        action={
          <button
            type="button"
            onClick={() => setProgressOpen(true)}
            className="bg-[var(--semantic-brand-primary)] flex items-center rounded-lg overflow-hidden shrink-0"
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
            <span className="bg-white flex flex-col items-center justify-center gap-0.5 px-2 py-1">
              <span className="text-xs text-[var(--semantic-brand-primary)]">点検済み</span>
              <span className="text-xl text-[var(--semantic-brand-primary)] leading-none">
                {inspectedCount}/{points.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-10 items-center">
        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
          {points.map((point) => (
            <Link
              key={point.id}
              to={`/app/ledger-list/water-inspection/points/${point.id}`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center px-4 py-3 rounded-lg w-full"
            >
              <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{point.name}</p>
              <span
                className="flex h-8 w-20 items-center justify-center rounded-lg text-sm text-white shrink-0"
                style={{ backgroundColor: POINT_STATUS_COLORS[point.status] }}
              >
                {POINT_STATUS_LABELS[point.status]}
              </span>
            </Link>
          ))}
        </div>

        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex h-16 items-center justify-center px-4 py-2 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>

      {progressOpen && <ProgressPanel points={points} onClose={() => setProgressOpen(false)} />}
    </div>
  );
}
