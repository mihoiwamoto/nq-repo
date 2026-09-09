import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { SAMPLE_ENTRIES, SAMPLE_TYPE_LABELS, type SampleConfirmState } from "./mockData";

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
  const state = location.state as (SampleConfirmState & { fromProgress?: boolean }) | null;
  const entry = SAMPLE_ENTRIES.find((e) => e.id === sampleId);
  const basePath = "/app/ledger-list/sample-management";
  const fromProgress = state?.fromProgress ?? false;

  if (!entry || !state) {
    return (
      <>
        <AppHeader title="検体管理" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            点検内容が見つかりません。点検画面から操作してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/samples/${sampleId}`)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            点検画面に戻る
          </button>
        </div>
      </>
    );
  }

  const { inspectorName, inspectionDate, manufactureDate, sampleType, quantity, unit, storageLocation, remarks, timestamp } =
    state;
  const meta = `${inspectorName} ${timestamp}`;

  function handleSubmit() {
    navigate(`${basePath}/samples/${sampleId}/complete`, {
      state: { fromProgress },
    });
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 pb-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-wrap gap-x-10 gap-y-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <div className="flex gap-2 items-center">
            <p className="text-base text-[var(--semantic-text-secondary)]">製品名</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{entry.productName}</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-base text-[var(--semantic-text-secondary)]">賞味期限</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{entry.expiryDate}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{inspectorName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <ConfirmRow label="実施日" value={inspectionDate.replaceAll("-", "/")} meta={meta} />
          <ConfirmRow label="製造日" value={manufactureDate.replaceAll("-", "/")} meta={meta} />
          <ConfirmRow label="検体種別" value={SAMPLE_TYPE_LABELS[sampleType]} meta={meta} />
          <ConfirmRow label="検体数量" value={quantity} meta={meta} />
          <ConfirmRow label="単位" value={unit} meta={meta} />
          <ConfirmRow label="保管場所" value={storageLocation} meta={meta} />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-secondary)]">
              {remarks || "点検内容に関する補足を入力できます（任意）"}
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
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}
