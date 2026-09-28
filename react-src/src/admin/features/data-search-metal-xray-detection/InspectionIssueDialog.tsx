import { useState } from "react";
import { OkNgToggle } from "./OkNgToggle";

type CheckStatus = "ok" | "ng";

interface InspectionIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cause: string, response: string) => void;
  itemLabel: string;
  currentStatus?: CheckStatus;
}

export function InspectionIssueDialog({
  isOpen,
  onClose,
  onConfirm,
  itemLabel,
  currentStatus = "ng",
}: InspectionIssueDialogProps) {
  const [status, setStatus] = useState<CheckStatus>(currentStatus);
  const [cause, setCause] = useState("");
  const [response, setResponse] = useState("");

  const handleConfirm = () => {
    if (status === "ng") {
      if (!cause.trim() || !response.trim()) return;
    }
    onConfirm(cause, response);
    setCause("");
    setResponse("");
  };

  const handleClose = () => {
    setCause("");
    setResponse("");
    setStatus(currentStatus);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-4 py-10 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-6 items-start w-full">
          <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
            点検箇所
          </h2>
          <div className="flex items-center justify-between w-full gap-4">
            <p className="text-xl text-[var(--semantic-text-primary)] flex items-center gap-1">
              {itemLabel} <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <OkNgToggle
              status={status}
              onOk={() => setStatus("ok")}
              onNg={() => setStatus("ng")}
            />
          </div>
          {status === "ng" && (
            <>
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <textarea
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  placeholder="原因を記入してください。"
                  className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  対応 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="対応を記入してください。"
                  className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex gap-10 items-center justify-center w-full">
          <button
            type="button"
            onClick={handleClose}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={status === "ng" && (!cause.trim() || !response.trim())}
            onClick={handleConfirm}
            className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
              status === "ok" || (cause.trim() && response.trim())
                ? "bg-[var(--semantic-brand-primary)]"
                : "bg-[#d0d0d0]"
            }`}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
