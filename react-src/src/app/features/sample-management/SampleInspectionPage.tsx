import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PulldownSelect } from "../../components/PulldownSelect";
import { DateFilterInput } from "../../components/DateFilterInput";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { todayString } from "../../utils/date";
import { seedTimestamp, seedTimestamps, stampTimestamps } from "../../utils/recordTimestamps";
import { useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { SampleProductInfo } from "./SampleProductInfo";
import { ACTORS } from "../cleaning-record/mockData";
import {
  SAMPLE_ENTRIES,
  SAMPLE_REVIEW_DETAILS,
  SAMPLE_STORAGE_LOCATIONS,
  SAMPLE_TYPE_LABELS,
  SAMPLE_UNITS,
  type SampleType,
} from "./mockData";

export function SampleInspectionPage() {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as { inspectorName?: string; fromProgress?: boolean } | null;
  const inspectorName = stateData?.inspectorName ?? ACTORS[0].name;
  const fromProgress = stateData?.fromProgress ?? false;
  const entry = SAMPLE_ENTRIES.find((e) => e.id === sampleId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const entryFill: RecordFill = entry?.status === "inspected" ? "full" : "none";
  const fill = progressFill ?? entryFill;
  // s4 のように自前の入力済みデータを持たない検体は、他の検体の記録で「点検済み」の状態を再現する
  const reviewDetail =
    fill !== "none"
      ? SAMPLE_REVIEW_DETAILS[sampleId ?? ""] ?? Object.values(SAMPLE_REVIEW_DETAILS)[0]
      : undefined;
  // 点検中は前半の項目（実施日・製造日・検体区分）だけ入力済みにする
  const partial = fill === "partial";

  const [inspectionDate, setInspectionDate] = useState(() => reviewDetail?.inspectionDate ?? todayString());
  const [manufactureDate, setManufactureDate] = useState(() => reviewDetail?.manufactureDate ?? "");
  const [sampleType, setSampleType] = useState<SampleType | null>(() => reviewDetail?.sampleType ?? null);
  const [quantity, setQuantity] = useState(() => (partial ? "" : reviewDetail?.quantity ?? ""));
  const [unit, setUnit] = useState(() => (partial ? "" : reviewDetail?.unit ?? ""));
  const [storageLocation, setStorageLocation] = useState(() => (partial ? "" : reviewDetail?.storageLocation ?? ""));
  const [remarks, setRemarks] = useState(() => (partial ? "" : reviewDetail?.remarks ?? ""));
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  /** 項目ごとに「いつ入力したか」を持たせ、入力欄の下に実施者名と並べて出す。
   *  点検済み・記録途中で開いたときは、すでに入っている項目に実施日の時刻を出しておく */
  const [timestamps, setTimestamps] = useState<Record<string, string>>(() =>
    seedTimestamps(
      {
        manufactureDate: reviewDetail?.manufactureDate,
        sampleType: reviewDetail?.sampleType,
        quantity: partial ? "" : reviewDetail?.quantity,
        unit: partial ? "" : reviewDetail?.unit,
        storageLocation: partial ? "" : reviewDetail?.storageLocation,
      },
      seedTimestamp(reviewDetail?.inspectionDate)
    )
  );

  /** 値が入っていれば入力時刻を打ち、消して未記録に戻したら時刻表示も消す */
  function stamp(field: string, value: unknown) {
    setTimestamps((prev) => stampTimestamps(prev, field, value));
  }

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
        timestamps,
        fromProgress,
      },
    });
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <SampleProductInfo
              productName={entry.productName}
              expiryDate={entry.expiryDate}
              lotNumber={entry.lotNumber}
            />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <DateFilterInput value={inspectionDate} onChange={setInspectionDate} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  製造日 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <DateFilterInput
                  value={manufactureDate}
                  onChange={(v) => {
                    setManufactureDate(v);
                    stamp("manufactureDate", v);
                  }}
                />
              </div>
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.manufactureDate} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  検体種別 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex gap-4 items-center">
                  {(["product", "portion"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSampleType(type);
                        stamp("sampleType", type);
                      }}
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
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.sampleType} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  検体数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    stamp("quantity", e.target.value);
                  }}
                  placeholder="数量を入力"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
                />
              </div>
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.quantity} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  単位 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <PulldownSelect
                  value={unit}
                  onChange={(v) => {
                    setUnit(v);
                    stamp("unit", v);
                  }}
                  options={SAMPLE_UNITS}
                />
              </div>
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.unit} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  保管場所 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <PulldownSelect
                  value={storageLocation}
                  onChange={(v) => {
                    setStorageLocation(v);
                    stamp("storageLocation", v);
                  }}
                  options={SAMPLE_STORAGE_LOCATIONS}
                />
              </div>
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.storageLocation} />
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[560px] mx-6">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                途中保存しました
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)] whitespace-nowrap">
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
