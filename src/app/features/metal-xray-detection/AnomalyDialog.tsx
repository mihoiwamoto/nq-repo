import { useState } from "react";
import iconXMark from "../../../assets/figma/icons/common/cancel.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark.svg";
import { ProductSelectionDialog, type Product } from "./ProductSelectionDialog";
import { METAL_DETECTOR_CHECKLIST, XRAY_DETECTOR_CHECKLIST } from "./mockData";

interface AnomalyDialogProps {
  isOpen: boolean;
  type: "machine-record" | "test-piece" | "product";
  itemName: string;
  machineType?: "metal" | "xray";
  machineName?: string;
  onClose: () => void;
  onConfirm: (data: AnomalyData) => void;
}

export interface AnomalyData {
  cause?: string;
  response: string;
  responseType?: "inspection" | "settings" | "other-machine" | "other";
  inspectionResult?: "ok" | "ng";
}

export function AnomalyDialog({
  isOpen,
  type,
  itemName,
  machineType,
  machineName,
  onClose,
  onConfirm,
}: AnomalyDialogProps) {
  const [cause, setCause] = useState("");
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState<"inspection" | "settings" | "other-machine" | "other">("inspection");
  const [inspectionResult, setInspectionResult] = useState<"ok" | "ng" | null>("ng");
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  if (!isOpen) return null;

  const checklist = machineType === "metal" ? METAL_DETECTOR_CHECKLIST : XRAY_DETECTOR_CHECKLIST;

  // Find the group title for the item
  let groupTitle = "";
  for (const group of checklist) {
    if (group.items.some((item) => item.label === itemName)) {
      groupTitle = group.title;
      break;
    }
  }

  function handleConfirm() {
    console.log("handleConfirm called - type:", type, "inspectionResult:", inspectionResult);

    if (type === "test-piece" && inspectionResult === "ng" && (!responseType || (responseType === "other" && !response.trim()))) {
      console.log("test-piece validation failed");
      return;
    }
    if (type === "product" && (!cause.trim() || !response.trim())) {
      console.log("product validation failed");
      return;
    }
    if (type === "machine-record" && inspectionResult === "ng" && (!cause.trim() || !response.trim())) {
      console.log("machine-record validation failed - cause:", cause, "response:", response);
      return;
    }

    const data = {
      cause: (type === "product" || type === "machine-record") ? cause : undefined,
      response,
      responseType: type === "test-piece" ? responseType : undefined,
      inspectionResult: (type === "machine-record" || type === "test-piece") ? (inspectionResult ?? undefined) : undefined,
    };
    console.log("✅ Calling onConfirm with data:", data);

    onConfirm(data);

    setCause("");
    setResponse("");
    setResponseType("inspection");
    setInspectionResult("ng");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#F1EFEA] rounded-lg w-[640px] flex flex-col gap-0 shadow-lg max-h-[90vh]">
        <h2 className="text-[20px] font-bold text-[#333] px-6 py-6 text-center">
          点検箇所
        </h2>

        <div className="px-6 py-6 flex flex-col gap-6 max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden">
          {type === "machine-record" ? (
            <>
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="bg-[#009944] text-white px-4 py-4 flex items-center justify-between">
                  <span className="text-[16px] font-bold">{machineName || (machineType === "metal" ? "金属探知機" : "X線探知機")}</span>
                  <span className="text-[16px] font-bold">{groupTitle}</span>
                </div>

                <div className="bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[16px] font-bold text-[#009944] mb-2">{groupTitle}</p>
                      <p className="text-[14px] text-[#333]">
                        {itemName} <span className="text-[#f34949]">※</span>
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        type="button"
                        onClick={() => setInspectionResult("ng")}
                        className={`h-10 w-16 rounded-l-lg flex items-center justify-center transition-colors ${
                          inspectionResult === "ng"
                            ? "bg-[#f85c5c] text-white"
                            : inspectionResult === "ok"
                            ? "bg-[#d0d0d0] text-[#999]"
                            : "bg-[#d0d0d0] text-[#999]"
                        }`}
                      >
                        <img src={iconXMark} alt="異常あり" className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectionResult("ok")}
                        className={`h-10 w-16 rounded-r-lg flex items-center justify-center transition-colors ${
                          inspectionResult === "ok"
                            ? "bg-[#009944] text-white"
                            : "bg-[#d0d0d0] text-[#999]"
                        }`}
                      >
                        <img src={iconCheck} alt="正常" className="size-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {inspectionResult === "ng" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[16px] font-bold text-[#333]">
                      原因 <span className="text-[#f34949]">※</span>
                    </label>
                    <textarea
                      value={cause}
                      onChange={(e) => setCause(e.target.value)}
                      placeholder="原因を記入してください。"
                      className="bg-white w-full h-[80px] p-3 rounded-lg text-[14px] resize-none text-[#333] placeholder:text-[#999] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[16px] font-bold text-[#333]">
                      対応 <span className="text-[#f34949]">※</span>
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="対応を記入してください。"
                      className="bg-white w-full h-[80px] p-3 rounded-lg text-[14px] resize-none text-[#333] placeholder:text-[#999] focus:outline-none"
                    />
                  </div>
                </>
              )}
            </>
          ) : type === "test-piece" ? (
            <>
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="bg-[#009944] text-white px-4 py-4 flex items-center justify-between">
                  <span className="text-[16px] font-bold">{machineType === "metal" ? "金属探知機" : "X線探知機"}</span>
                  <span className="text-[16px] font-bold">{itemName}</span>
                </div>

                <div className="flex items-center justify-between bg-white px-4 py-4 rounded-b-lg">
                  <p className="text-[16px] font-bold text-[#333]">
                    検知確認：{machineType === "metal" ? "Fe" : "異物"} <span className="text-[#f34949]">※</span>
                  </p>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setInspectionResult("ng")}
                      className={`w-[60px] h-[40px] rounded-l-lg flex items-center justify-center ${
                        inspectionResult === "ng"
                          ? "bg-[#f85c5c] text-white"
                          : "bg-[#d0d0d0] text-[#999]"
                      }`}
                    >
                      <img src={iconXMark} alt="異常あり" className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionResult("ok")}
                      className={`w-[60px] h-[40px] rounded-r-lg flex items-center justify-center ${
                        inspectionResult === "ok"
                          ? "bg-[#009944] text-white"
                          : "bg-[#d0d0d0] text-[#999]"
                      }`}
                    >
                      <img src={iconCheck} alt="正常" className="size-5" />
                    </button>
                  </div>
                </div>

                {inspectionResult === "ng" && (
                  <div className="flex flex-col gap-2 mt-6">
                    <p className="text-[16px] font-bold text-[#333]">
                      対応 <span className="text-[#f34949]">※</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "inspection", label: "点検調整" },
                        { value: "settings", label: "修理依頼" },
                        { value: "other-machine", label: "他機使用" },
                        { value: "other", label: "その他" },
                      ].map((btn) => (
                        <button
                          key={btn.value}
                          type="button"
                          onClick={() => setResponseType(btn.value as any)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                            responseType === btn.value
                              ? "bg-white text-[#009944] border-[#009944]"
                              : "bg-white text-[#333] border-[#d0d0d0]"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {responseType === "other" && (
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="対応を記入してください。"
                    className="bg-white w-full h-24 p-3 border border-[#d0d0d0] rounded-lg text-sm resize-none text-[#333] placeholder:text-[#999] mt-4"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="bg-[#009944] text-white px-4 py-4 flex items-center justify-between">
                  <span className="text-[16px] font-bold">{machineType === "metal" ? "金属探知機" : "X線探知機"}</span>
                  <span className="text-[16px] font-bold">{itemName}</span>
                </div>
                <div className="bg-white px-4 py-4 flex flex-col gap-3">
                  <p className="text-[16px] font-bold text-[#333]">
                    確認項目 <span className="text-[#f34949]">※</span>
                  </p>
                  <div className="flex gap-0">
                    <button
                      type="button"
                      className="flex-1 h-[40px] rounded-l-lg bg-[#f85c5c] text-white flex items-center justify-center"
                    >
                      <img src={iconXMark} alt="異常あり" className="size-5" />
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-[40px] rounded-r-lg bg-[#d0d0d0] text-[#999] flex items-center justify-center"
                    >
                      <img src={iconCheck} alt="正常" className="size-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[16px] font-bold text-[#333]">
                  対応 <span className="text-[#f34949]">※</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
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
                      className={`py-2 rounded-lg text-sm font-medium transition-colors text-center ${
                        responseType === btn.value
                          ? "bg-[#009944] text-white border-2 border-[#009944]"
                          : "bg-white text-[#333]"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProductSelectionOpen(true)}
                className="w-full py-3 rounded-lg bg-[#009944] text-white font-bold text-[16px] hover:opacity-90"
              >
                製品追加
              </button>

              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-bold text-[#333]">
                  内容 <span className="text-[#f34949]">※</span>
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={responseType === "other" || responseType === "inspection" || responseType === "other-machine" ? "対応内容を入力してください。" : ""}
                  className="bg-white w-full h-[80px] p-3 border border-[#d0d0d0] rounded-lg text-[14px] resize-none text-[#333] placeholder:text-[#999] focus:outline-none focus:border-[#009944]"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-[40px] px-6 py-6 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-56 py-4 rounded-lg border border-[#333] text-[#333] text-[16px] font-bold bg-white hover:bg-[#f5f5f5] transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-56 py-4 rounded-lg bg-[#009944] text-white text-[16px] font-bold hover:opacity-90 transition-opacity"
          >
            完了
          </button>
        </div>
      </div>

      <ProductSelectionDialog
        isOpen={isProductSelectionOpen}
        onClose={() => setIsProductSelectionOpen(false)}
        onConfirm={(products) => {
          setSelectedProducts(products);
          setIsProductSelectionOpen(false);
        }}
        availableProducts={[]}
      />
    </div>
  );
}
