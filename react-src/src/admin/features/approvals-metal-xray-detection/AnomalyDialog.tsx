import { useState } from "react";

interface AnomalyDialogProps {
  isOpen: boolean;
  type: "test-piece" | "product";
  itemName: string;
  equipmentName?: string;
  checkItem?: string;
  onClose: () => void;
  onConfirm: (data: AnomalyData) => void;
}

export interface AnomalyData {
  cause?: string;
  response: string;
  responseType?: "inspection" | "settings" | "other-machine" | "other";
}

export function AnomalyDialog({
  isOpen,
  type,
  itemName,
  equipmentName,
  checkItem,
  onClose,
  onConfirm,
}: AnomalyDialogProps) {
  const [cause, setCause] = useState("");
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState<"inspection" | "settings" | "other-machine" | "other">("inspection");

  if (!isOpen) return null;

  function handleConfirm() {
    if (type === "test-piece" && !response.trim()) {
      return;
    }
    if (type === "product" && (!cause.trim() || !response.trim())) {
      return;
    }

    onConfirm({
      cause: type === "product" ? cause : undefined,
      response,
      responseType: type === "test-piece" ? responseType : undefined,
    });

    setCause("");
    setResponse("");
    setResponseType("inspection");
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[640px] h-[738px] flex flex-col gap-0 shadow-lg">
        <h2 className="text-[20px] font-bold text-[#333] px-6 py-6 text-center border-b border-[#d0d0d0]">
          点検箇所
        </h2>

        <div className="px-6 py-6 flex flex-col gap-6">
          {equipmentName && (
            <div className="flex flex-col rounded-lg overflow-hidden">
              <div className="bg-[#009944] text-white px-4 py-4 flex items-center justify-between">
                <span className="text-[16px] font-bold">{equipmentName}</span>
                <span className="text-[16px] font-bold">{itemName}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-bold text-[#333]">
              対応 <span className="text-[#f34949]">※</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "inspection", label: "点検実施" },
                { value: "settings", label: "機械設定" },
                { value: "other-machine", label: "他機械印" },
                { value: "other", label: "その他" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setResponseType(btn.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    responseType === btn.value
                      ? "bg-[#009944] text-white border border-[#009944]"
                      : "bg-white text-[#333] border border-[#d0d0d0]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="対応内容を記入してください。"
            className="w-full h-24 p-3 border border-[#d0d0d0] rounded-lg text-sm resize-none text-[#333] placeholder:text-[#999] bg-white"
          />
        </div>

        <div className="flex gap-0 px-6 py-6 border-t border-[#d0d0d0]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-l-lg border border-[#333] text-[#333] text-[16px] font-bold bg-white hover:bg-[#f5f5f5] transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-r-lg bg-[#009944] text-white text-[16px] font-bold hover:opacity-90 transition-opacity"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
