import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { MachineProgressPanel } from "./MachineProgressPanel";
import { MACHINE_STATUS_COLORS, MACHINE_STATUS_LABELS, MACHINES } from "./mockData";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";

export function MachineSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const inspectorName = (location.state as { inspectorName?: string } | null)?.inspectorName ?? "";
  const [progressDrawerOpen, setProgressDrawerOpen] = useState(false);

  const inspectedCount = MACHINES.filter((m) => m.status === "inspected").length;

  return (
    <>
      <AppHeader
        title="金属/X線探知機記録"
        action={
          <button
            type="button"
            onClick={() => setProgressDrawerOpen(true)}
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
                {inspectedCount}/{MACHINES.length}
              </span>
            </span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 items-center relative">
        <div className="flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
          {MACHINES.map((machine) => (
            <button
              key={machine.id}
              type="button"
              onClick={() => {
                navigate(`/app/ledger-list/metal-xray-detection/machines/${machine.id}`, {
                  state: { inspectorName },
                });
              }}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex gap-2 h-20 items-center p-4 rounded-lg w-full cursor-pointer hover:shadow-[0px_4px_8px_rgba(51,51,51,0.32)] transition-shadow"
            >
              <p className="flex-1 text-lg text-[var(--semantic-text-primary)] text-left">{machine.name}</p>
              <span
                className="flex h-8 w-20 items-center justify-center rounded-lg text-sm text-white shrink-0"
                style={{ backgroundColor: MACHINE_STATUS_COLORS[machine.status] }}
              >
                {MACHINE_STATUS_LABELS[machine.status]}
              </span>
            </button>
          ))}
        </div>

        <Link
          to="/app/ledger-list"
          className="bg-white border border-[var(--semantic-text-primary)] flex h-16 items-center justify-center px-4 py-2 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">帳票一覧に戻る</span>
        </Link>
      </div>

      {progressDrawerOpen && <MachineProgressPanel onClose={() => setProgressDrawerOpen(false)} />}
    </>
  );
}
