import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";

interface SpecimenConfirmState {
  productName: string;
  expiryDate: string;
  inspectorName: string;
  inspectionDate: string;
  manufactureDate: string;
  specimenType: string;
  quantity: string;
  unit: string;
  storageLocation: string;
  remarks: string;
  timestamp: string;
}

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
          <p className="text-base font-semibold text-[#333]">{label}</p>
          <p className="text-base text-[#333]">{value}</p>
        </div>
        {meta && <p className="text-sm text-[#808080] text-right w-full">{meta}</p>}
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
    </>
  );
}

export function SpecimenManagementConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SpecimenConfirmState | null;

  if (!state) {
    return (
      <>
        <AppHeader title="検体管理" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            検体情報が見つかりません。
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            戻る
          </button>
        </div>
      </>
    );
  }

  const {
    productName,
    expiryDate,
    inspectorName,
    inspectionDate,
    manufactureDate,
    specimenType,
    quantity,
    unit,
    storageLocation,
    remarks,
    timestamp,
  } = state;

  const meta = `${inspectorName} ${timestamp}`;

  function handleSubmit() {
    navigate("/app/pending-review");
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 pb-24 flex flex-col gap-4 items-center">
        {/* Alert Banner */}
        <div className="bg-[#f7f292] flex gap-2 items-start p-4 rounded-lg w-full max-w-[672px]">
          <img src={iconAttention} alt="注意" className="size-6 shrink-0 mt-0.5" />
          <p className="text-sm text-[#333] leading-tight">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        {/* Product Info */}
        <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-[672px]">
          <div className="flex gap-20 items-center">
            <div className="flex gap-2 items-center">
              <p className="text-base text-[#808080]">製品名</p>
              <p className="text-base text-[#333]">{productName}</p>
            </div>
          </div>
          <div className="flex gap-20 items-center">
            <div className="flex gap-2 items-center">
              <p className="text-base text-[#808080]">賞味期限</p>
              <p className="text-base text-[#333]">{expiryDate}</p>
            </div>
          </div>
        </div>

        {/* Confirm Items */}
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-[672px]">
          <div className="flex items-center justify-between w-full">
            <p className="text-base font-semibold text-[#333]">実施者</p>
            <p className="text-base text-[#333]">{inspectorName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <ConfirmRow label="実施日" value={inspectionDate.replaceAll("-", "/")} meta={meta} />
          <ConfirmRow label="製造日" value={manufactureDate.replaceAll("-", "/")} meta={meta} />
          <ConfirmRow label="検体種別" value={specimenType} meta={meta} />
          <ConfirmRow label="検体数量" value={quantity} meta={meta} />
          <ConfirmRow label="単位" value={unit} meta={meta} />
          <ConfirmRow label="保管場所" value={storageLocation} meta={meta} />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-base font-semibold text-[#333]">備考</p>
            <p className="text-base text-[#333] whitespace-pre-wrap break-words">
              {remarks || "特記事項なし"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border-2 border-[#333] h-16 w-60 rounded-lg text-xl font-semibold text-[#333] hover:bg-gray-50 transition-colors"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[#094] h-16 w-60 rounded-lg text-xl font-semibold text-white hover:bg-[#07a] transition-colors"
        >
          提出
        </button>
      </div>
    </>
  );
}
