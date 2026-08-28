import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { DISCARD_REASON_LABELS, SAMPLE_TYPE_LABELS, STORED_SAMPLES, type DiscardReason } from "./mockData";
import trashIcon from "@images/Icon/trash.svg";
import burnIcon from "@images/Icon/burn.svg";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between w-full">
      <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
      <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
    </div>
  );
}

function DestructionLabel() {
  return (
    <div className="bg-[var(--semantic-brand-danger)] flex flex-col items-center rounded shrink-0 w-10 p-0.5">
      <img src={burnIcon} alt="burn" className="w-6 h-6" />
      <span className="bg-white text-[var(--semantic-brand-danger)] text-[8px] rounded-b w-full text-center py-0.5">
        破棄対象
      </span>
    </div>
  );
}

export function StoredSampleDetailPage() {
  const { storedId } = useParams<{ storedId: string }>();
  const navigate = useNavigate();
  const sample = STORED_SAMPLES.find((s) => s.id === storedId);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [discardDate, setDiscardDate] = useState("");
  const [discardReason, setDiscardReason] = useState<DiscardReason | null>(null);
  const [otherReasonText, setOtherReasonText] = useState("");
  const [discardCompleteDialogOpen, setDiscardCompleteDialogOpen] = useState(false);
  const basePath = "/app/ledger-list/sample-management";

  if (!sample) return null;

  const canDiscard = discardDate.trim() !== "" && discardReason !== null;

  function openDiscardDialog() {
    setDiscardDate("");
    setDiscardReason("expired");
    setDiscardDialogOpen(true);
  }

  function handleDiscard() {
    if (!canDiscard) return;
    setDiscardDialogOpen(false);
    setDiscardCompleteDialogOpen(true);
  }

  function handleCompleteClose() {
    setDiscardCompleteDialogOpen(false);
    navigate(basePath, { state: { tab: "storage", discardedId: storedId } });
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-4 items-end w-full max-w-full max-w-[480px] mx-40">
          <div className="bg-white flex gap-2 items-center p-4 rounded-lg w-full">
            <div className="flex-1 flex flex-col gap-2 items-start min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-base text-[var(--semantic-text-secondary)]">製品名</span>
                <span className="text-base text-[var(--semantic-text-primary)]">{sample.productName}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-base text-[var(--semantic-text-secondary)]">賞味期限</span>
                <span className="text-base text-[var(--semantic-text-primary)]">
                  {sample.expiryDate.replaceAll("-", "/")}
                </span>
              </div>
            </div>
            {sample.destructionTarget && <DestructionLabel />}
          </div>

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
            <Row label="実施者" value={sample.inspectorName} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <Row label="実施日" value={sample.inspectionDate.replaceAll("-", "/")} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <Row label="製造日" value={sample.manufactureDate.replaceAll("-", "/")} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <Row label="検体種別" value={SAMPLE_TYPE_LABELS[sample.sampleType]} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <Row label="検体数量" value={sample.quantity} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <Row label="単位" value={sample.unit} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <Row label="保管場所" value={sample.storageLocation} />
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-secondary)]">
                {sample.remarks || "特記事項はありません"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openDiscardDialog}
          className="bg-[var(--semantic-brand-danger)] flex gap-2 h-16 items-center justify-center rounded-lg w-90 max-w-full text-xl text-white"
        >
          <img src={trashIcon} alt="trash" className="w-8 h-8" style={{ filter: "brightness(0) invert(1)" }} />
          破棄
        </button>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
      </div>

      {discardDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDiscardDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-center w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">検体破棄</h2>

              <div className="bg-white flex gap-2 items-center p-4 rounded-lg w-full">
                <div className="flex-1 flex flex-col gap-2 items-start min-w-0">
                  <div className="flex gap-2 items-center">
                    <span className="text-base text-[var(--semantic-text-secondary)]">製品名</span>
                    <span className="text-base text-[var(--semantic-text-primary)]">
                      {sample.productName}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-base text-[var(--semantic-text-secondary)]">賞味期限</span>
                    <span className="text-base text-[var(--semantic-text-primary)]">
                      {sample.expiryDate.replaceAll("-", "/")}
                    </span>
                  </div>
                </div>
                {sample.destructionTarget && <DestructionLabel />}
              </div>

              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  破棄日 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <input
                  type="date"
                  value={discardDate}
                  onChange={(e) => setDiscardDate(e.target.value)}
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
                />
              </div>

              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  理由 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex flex-wrap gap-4 w-full">
                  {(["expired", "other"] as const).map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setDiscardReason(reason);
                        if (reason !== "other") setOtherReasonText("");
                      }}
                      className={`h-12 w-34 rounded-lg text-base border ${
                        discardReason === reason
                          ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                      }`}
                    >
                      {DISCARD_REASON_LABELS[reason]}
                    </button>
                  ))}
                </div>
                {discardReason === "other" && (
                  <input
                    type="text"
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="理由を入力してください"
                    className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full border border-[#d0d0d0] placeholder:text-[var(--semantic-text-secondary)]"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDiscardDialogOpen(false)}
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!canDiscard}
                onClick={handleDiscard}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  canDiscard ? "bg-[var(--semantic-brand-danger)]" : "bg-[#d0d0d0]"
                }`}
              >
                破棄
              </button>
            </div>
          </div>
        </div>
      )}

      {discardCompleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => handleCompleteClose()} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-4 items-center w-full">
              <div className="w-16 h-16 rounded-full bg-[var(--semantic-status-success)] flex items-center justify-center">
                <span className="text-white text-4xl">✓</span>
              </div>
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center">廃棄が完了しました</h2>
            </div>
            <button
              type="button"
              onClick={handleCompleteClose}
              className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      )}
    </>
  );
}
