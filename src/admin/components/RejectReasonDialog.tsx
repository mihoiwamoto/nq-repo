import { useState } from "react";

export function RejectReasonDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [reason, setReason] = useState("");
  const canConfirm = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-8 py-8 w-[480px]">
        <p className="text-xl font-bold text-[var(--semantic-text-primary)] text-center">
          差し戻し理由
        </p>
        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-base text-[var(--semantic-text-primary)]">差し戻し理由を記入してください</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 255))}
            placeholder="差し戻し理由"
            rows={5}
            autoFocus
            className="w-full bg-white border border-[var(--semantic-brand-primary)] px-3 py-3 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[#808080] resize-none focus:outline-none"
          />
          <span className="text-sm text-[#333] text-right w-full">{reason.length}/255</span>
        </div>
        <div className="flex gap-4 items-center w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-lg border border-[#333] text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`flex-1 h-12 rounded-lg text-base text-white ${
              canConfirm ? "bg-[var(--semantic-brand-danger)]" : "bg-[#d0d0d0]"
            }`}
          >
            差し戻し
          </button>
        </div>
      </div>
    </div>
  );
}
