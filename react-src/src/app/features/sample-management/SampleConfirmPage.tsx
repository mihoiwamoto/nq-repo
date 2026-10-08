import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { SampleProductInfo } from "./SampleProductInfo";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import type { ProgressStatus } from "../progress/mockData";
import { SAMPLE_ENTRIES, SAMPLE_TYPE_LABELS, type SampleConfirmState } from "./mockData";
import { findFactoryItem } from "../../data/factoryAppData";

function ConfirmRow({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-2 items-start w-full">
        <div className="flex items-center justify-between w-full">
          <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
          <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
        </div>
        {meta && <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{meta}</p>}
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
    </>
  );
}

export function SampleConfirmPage() {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as
    | (SampleConfirmState & {
        fromProgress?: boolean;
        /** 進捗一覧の点検済み・確認完了から実施者を選ばずに来た、結果の詳細（読むだけ。確定デザイン 6198:81533） */
        progressView?: boolean;
        progressStatus?: ProgressStatus;
      })
    | null;
  const entry = findFactoryItem(SAMPLE_ENTRIES, sampleId);
  const basePath = "/app/ledger-list/sample-management";
  const fromProgress = routeState?.fromProgress ?? false;
  const progressView = routeState?.progressView ?? false;

  // 本番（Excel No.50）は点検内容を持たずに開いても案内は出さず、空の内容で通常の確認画面を出す（2026-10-08）
  if (!entry) return null;
  const state: NonNullable<typeof routeState> = routeState ?? {
    inspectorName: "",
    inspectionDate: "",
    manufactureDate: "",
    sampleType: undefined as unknown as SampleConfirmState["sampleType"],
    quantity: "",
    unit: "",
    storageLocation: "",
    remarks: "",
  };

  const { inspectorName, inspectionDate, manufactureDate, sampleType, quantity, unit, storageLocation, remarks } =
    state;
  // 記録画面で項目ごとに付いた入力時刻。記録が無い項目には時刻も無いので、その行には出ない
  const timestamps = state.timestamps ?? {};
  const metaFor = (field: string) => (timestamps[field] ? `${inspectorName} ${timestamps[field]}` : undefined);

  function handleSubmit() {
    navigate(`${basePath}/samples/${sampleId}/complete`, {
      state: { fromProgress },
    });
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 pb-4 flex flex-col gap-4 items-center">
        {progressView ? (
          /* 点検済みは「編集」で記録画面へ（確認完了は読むだけ） */
          state.progressStatus === "inspected" && (
            <div className="flex justify-end w-full max-w-full">
              <button
                type="button"
                onClick={() =>
                  navigate(`${basePath}/samples/${sampleId}`, {
                    state: { inspectorName, fromProgress: true, progressStatus: state.progressStatus },
                  })
                }
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)]"
              >
                <img src={iconEdit} alt="編集" className="size-5" />
                編集
              </button>
            </div>
          )
        ) : (
          <div className="bg-[#f7f292] flex gap-2 items-center min-h-14 px-4 py-2 rounded-lg w-full max-w-full">
            <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
            <p className="text-sm text-[var(--semantic-text-primary)]">
              実施者、入力内容に誤りがないか提出前にご確認ください。
            </p>
          </div>
        )}

        <SampleProductInfo
          productName={entry.productName}
          expiryDate={entry.expiryDate}
          lotNumber={entry.lotNumber}
        />

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{inspectorName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          {/* 実施日は記録のヘッダ情報なのでタイムスタンプは付けない（記録画面と同じ扱い） */}
          <ConfirmRow label="実施日" value={inspectionDate.replaceAll("-", "/")} />
          <ConfirmRow label="製造日" value={manufactureDate.replaceAll("-", "/")} meta={metaFor("manufactureDate")} />
          <ConfirmRow label="検体種別" value={sampleType ? SAMPLE_TYPE_LABELS[sampleType] : ""} meta={metaFor("sampleType")} />
          <ConfirmRow label="検体数量" value={quantity} meta={metaFor("quantity")} />
          <ConfirmRow label="単位" value={unit} meta={metaFor("unit")} />
          <ConfirmRow label="保管場所" value={storageLocation} meta={metaFor("storageLocation")} />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-secondary)]">
              {remarks}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        {!progressView && (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
          >
            提出
          </button>
        )}
      </div>
    </>
  );
}
