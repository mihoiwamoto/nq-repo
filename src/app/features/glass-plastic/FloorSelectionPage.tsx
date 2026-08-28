import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useGlassPlastic } from "./GlassPlasticContext";
import { FloorProgressPanel } from "./FloorProgressPanel";
import { ACTORS } from "../cleaning-record/mockData";
import { FLOOR_STATUS_COLORS, FLOOR_STATUS_LABELS } from "./mockData";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";

export function FloorSelectionPage() {
  const { floors } = useGlassPlastic();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const [progressOpen, setProgressOpen] = useState(false);

  const inspectedCount = floors.filter((floor) => floor.status === "inspected").length;
  const inspectedFloors = floors.filter((floor) => floor.status === "inspected");

  return (
    <>
      <AppHeader
        title="ガラス・プラスチック管理"
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
                {inspectedCount}/{floors.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center relative">
        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
          {floors.map((floor) => (
            <Link
              key={floor.id}
              to={`/app/ledger-list/glass-plastic/floors/${floor.id}`}
              state={{ inspectorName }}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full"
            >
              <p className="flex-1 text-lg text-[var(--semantic-text-primary)]">{floor.name}</p>
              <span
                className="flex h-8 w-20 items-center justify-center rounded-lg text-sm text-white shrink-0"
                style={{ backgroundColor: FLOOR_STATUS_COLORS[floor.status] }}
              >
                {FLOOR_STATUS_LABELS[floor.status]}
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

      {progressOpen && <FloorProgressPanel floors={floors} inspectedFloors={inspectedFloors} onClose={() => setProgressOpen(false)} />}
    </>
  );
}
