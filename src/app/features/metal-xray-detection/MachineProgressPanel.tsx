import { MACHINES, MACHINE_RECORDS, MACHINE_INSPECTED_AT, MACHINE_STATUS_LABELS, type Machine } from "./mockData";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

export function MachineProgressPanel({ onClose }: { onClose: () => void }) {
  const inspectedMachines = MACHINES.filter((m) => m.status === "inspected");
  const total = MACHINES.length;
  const inspectedCount = inspectedMachines.length;
  const progressPercent = total === 0 ? 0 : (inspectedCount / total) * 100;

  return (
    <div className="absolute inset-0 z-20 flex justify-end">
      <button
        type="button"
        aria-label="進捗パネルを閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex h-full">
        <button
          type="button"
          onClick={onClose}
          aria-label="進捗パネルを閉じる"
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex items-center justify-center w-[46px] h-[46px] rounded-l-lg shrink-0 mt-[10px]"
        >
          <span
            aria-hidden
            className="inline-block size-5 shrink-0 text-white"
            style={{
              WebkitMaskImage: `url("${iconArrowRight}")`,
              maskImage: `url("${iconArrowRight}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              backgroundColor: "currentColor",
            }}
          />
        </button>
        <div className="bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-full w-[348px] px-6 py-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-1 w-full shrink-0">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl font-semibold text-[var(--semantic-brand-primary)]">
                点検済み
              </p>
              <p className="text-2xl font-semibold text-[var(--semantic-brand-primary)]">
                {inspectedCount}/{total}
              </p>
            </div>
            <div className="bg-[#d9d9d9] h-4 rounded-lg w-full overflow-hidden">
              <div
                className="bg-[var(--semantic-brand-primary)] h-4 rounded-lg"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
            {inspectedMachines.map((machine, index) => (
              <div key={machine.id} className="flex flex-col items-center w-full">
                <div className="bg-white flex flex-col gap-1 items-start justify-center px-2 py-4 rounded-lg w-full">
                  <span className="flex h-8 w-20 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#DCAA14" }}>
                    点検済み
                  </span>
                  <p className="text-lg font-semibold text-[var(--semantic-brand-primary)]">
                    {machine.name}
                  </p>
                  <div className="flex items-start justify-between w-full">
                    <p className="text-sm text-[var(--semantic-text-primary)]">
                      {(MACHINE_RECORDS[machine.id]?.[0]?.inspectorName) ?? "-"}
                    </p>
                    <p className="text-sm text-[var(--semantic-text-secondary)]">
                      {MACHINE_INSPECTED_AT[machine.id] ?? ""}
                    </p>
                  </div>
                </div>
                {index < inspectedMachines.length - 1 && (
                  <div className="h-6 border-l border-dotted border-[var(--semantic-brand-primary)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
