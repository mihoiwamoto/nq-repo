import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";

type CheckStatus = "ok" | "ng" | null;

interface OkNgToggleProps {
  status: CheckStatus;
  onOk: () => void;
  onNg: () => void;
  timestamp?: string;
  inspectorName?: string;
}

export function OkNgToggle({
  status,
  onOk,
  onNg,
  timestamp,
  inspectorName,
}: OkNgToggleProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center rounded-lg overflow-hidden shrink-0">
        <button
          type="button"
          onClick={onNg}
          className={`h-12 w-20 flex items-center justify-center text-white text-xl ${
            status === "ng" ? "bg-[var(--semantic-status-error)]" : "bg-[#d0d0d0]"
          }`}
        >
          <img src={iconXMark} alt="異常あり" className="size-5" />
        </button>
        <button
          type="button"
          onClick={onOk}
          className={`h-12 w-20 flex items-center justify-center text-white text-xl ${
            status === "ok" ? "bg-[var(--semantic-status-success)]" : "bg-[#d0d0d0]"
          }`}
        >
          <img src={iconCheck} alt="正常" className="size-5" />
        </button>
      </div>
      {status && timestamp && (
        <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">
          {inspectorName} {timestamp}
        </p>
      )}
    </div>
  );
}
