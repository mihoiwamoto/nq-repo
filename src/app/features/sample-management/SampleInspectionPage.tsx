import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { ACTORS } from "../cleaning-record/mockData";
import {
  SAMPLE_ENTRIES,
  SAMPLE_STORAGE_LOCATIONS,
  SAMPLE_TYPE_LABELS,
  SAMPLE_UNITS,
  type SampleType,
} from "./mockData";
import { CustomSelect } from "./CustomSelect";

function formatTimestamp(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function SampleInspectionPage() {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as { inspectorName?: string; fromProgress?: boolean } | null;
  const inspectorName = stateData?.inspectorName ?? ACTORS[0].name;
  const fromProgress = stateData?.fromProgress ?? false;
  const entry = SAMPLE_ENTRIES.find((e) => e.id === sampleId);

  const [inspectionDate, setInspectionDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [sampleType, setSampleType] = useState<SampleType | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  if (!entry) return null;

  const basePath = "/app/ledger-list/sample-management";

  const canProceed =
    inspectionDate.trim() !== "" &&
    manufactureDate.trim() !== "" &&
    sampleType !== null &&
    quantity.trim() !== "" &&
    unit !== "" &&
    storageLocation !== "";

  function goToConfirm() {
    if (!canProceed || !sampleType) return;
    navigate(`${basePath}/samples/${sampleId}/confirm`, {
      state: {
        inspectorName,
        inspectionDate,
        manufactureDate,
        sampleType,
        quantity,
        unit,
        storageLocation,
        remarks,
        timestamp: formatTimestamp(new Date()),
        fromProgress,
      },
    });
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full max-w-[480px] mx-40">
            <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full">
              <div className="flex gap-2 items-center">
                <p className="text-base text-[var(--semantic-text-secondary)]">製品名</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{entry.productName}</p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-base text-[var(--semantic-text-secondary)]">賞味期限</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{entry.expiryDate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
              />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                製造日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
              />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                検体種別 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex gap-4 items-center">
                {(["product", "portion"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSampleType(type)}
                    className={`h-12 w-34 rounded-lg text-base border ${
                      sampleType === type
                        ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                    }`}
                  >
                    {SAMPLE_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                検体数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="数量を入力"
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                単位 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="w-[240px]">
                <CustomSelect
                  value={unit}
                  onChange={setUnit}
                  options={SAMPLE_UNITS}
                  placeholder="選択してください"
                />
              </div>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                保管場所 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="w-[240px]">
                <CustomSelect
                  value={storageLocation}
                  onChange={setStorageLocation}
                  options={SAMPLE_STORAGE_LOCATIONS}
                  placeholder="選択してください"
                />
              </div>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="テキストを入力"
                className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-white border border-[#333] h-16 w-34 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
          >
            戻る
          </button>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-43 rounded-lg text-xl text-[var(--semantic-brand-primary)] px-4"
            >
              途中保存
            </button>
            <button
              type="button"
              disabled={!canProceed}
              onClick={goToConfirm}
              className={`h-16 w-43 rounded-lg text-xl px-4 ${
                canProceed ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-[#d0d0d0] text-white"
              }`}
            >
              確認画面へ
            </button>
          </div>
        </div>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                途中保存しました
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                入力内容を途中保存しました。続きは後から入力できます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveDialogOpen(false)}
              className="bg-white border border-[#333] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
