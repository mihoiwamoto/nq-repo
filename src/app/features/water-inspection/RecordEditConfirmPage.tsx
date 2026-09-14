import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAnnouncementBar } from "../../layout/AnnouncementBarContext";
import { useWaterInspection } from "./WaterInspectionContext";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import type { CheckItem } from "./mockData";
import type { RecordEditFormState } from "./RecordEditPage";

function StatusTag({ status }: { status: CheckItem["status"] }) {
  if (status === "ng") {
    return (
      <span className="bg-[var(--semantic-status-error)] flex h-6 w-16 items-center justify-center rounded-lg text-xs text-white shrink-0">
        異常あり
      </span>
    );
  }
  return (
    <span className="bg-[var(--semantic-status-success)] flex h-6 w-16 items-center justify-center rounded-lg text-xs text-white shrink-0">
      正常
    </span>
  );
}

function Row({
  label,
  value,
  hideBorder,
  timestamp,
}: {
  label: string;
  value: string;
  hideBorder?: boolean;
  timestamp?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 w-full py-3 ${!hideBorder && "border-b border-[#d0d0d0]"}`}>
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
      </div>
      {timestamp && (
        <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
      )}
    </div>
  );
}

function CheckRow({ item, timestamp }: { item: CheckItem; timestamp?: string }) {
  return (
    <div className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{item.label}</p>
        <StatusTag status={item.status} />
      </div>
      {item.status === "ng" && (
        <div className="flex flex-col gap-1 px-2 text-[13px] text-[var(--semantic-text-secondary)]">
          <p>原因：{item.cause}</p>
          <p>対応：{item.action}</p>
        </div>
      )}
      {timestamp && (
        <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
      )}
    </div>
  );
}

function ToggleRow({ label, checked }: { label: string; checked: boolean }) {
  if (!checked) return null;
  return (
    <div className="flex justify-end w-full pb-3 -mt-1">
      <span className="flex items-center gap-1 text-base text-[var(--semantic-status-success)]">
        <svg viewBox="0 0 24 24" className="size-6" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M7.5 12.5l3 3 6-6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </span>
    </div>
  );
}

export function RecordEditConfirmPage() {
  const { pointId, recordId } = useParams<{ pointId: string; recordId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { recordsByPoint, updateRecord } = useWaterInspection();
  const { notifyOfflineInspection } = useAnnouncementBar();
  const state = location.state as RecordEditFormState | null;
  const original = pointId ? recordsByPoint[pointId]?.find((r) => r.id === recordId) : undefined;

  const [showExitDialog, setShowExitDialog] = useState(false);

  if (!state || !original || !pointId || !recordId) {
    return (
      <>
        <AppHeader title="使用水の点検" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            点検内容が見つかりません。編集画面から操作してください。
          </p>
        </div>
      </>
    );
  }

  // 編集画面で項目ごとに付いた入力時刻を「実施者 + 入力時刻」の形にして各行に添える
  const inspectorName = state.inspectorName ?? original.inspector;
  const checkTimestamps = state.checkTimestamps ?? {};
  const fieldTimestamps = state.fieldTimestamps ?? {};
  const metaFor = (timestamp?: string) => (timestamp ? `${inspectorName} ${timestamp}` : undefined);

  function handleSave() {
    updateRecord(pointId, {
      ...original,
      date: state.date.replaceAll("-", "/"),
      checks: state.checks,
      phValue: state.phValue,
      residualChlorine: state.residualChlorine,
      chlorineToggle: { ...original.chlorineToggle, checked: state.chlorineChecked },
      uvOperatingHours: state.uvOperatingHours,
      uvToggle: { ...original.uvToggle, checked: state.uvChecked },
      uvIndicatorLight: state.uvIndicatorOk ? "点灯" : "消灯",
      errorIndicatorLight: state.errorIndicatorOk ? "消灯" : "点灯",
    });
    if (!navigator.onLine) notifyOfflineInspection();
    navigate(
      `/app/ledger-list/water-inspection/points/${pointId}/records/${recordId}/edit/complete`
    );
  }

  function handleDiscardAndLeave() {
    setShowExitDialog(false);
    navigate(-1);
  }

  return (
    <>
      <AppHeader title={`使用水の点検_${original.location}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-[640px]">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>
        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full">
          <Row label="実施者" value={original.inspector} />
          <Row label="点検場所" value={original.location} />
          <Row label="実施日" value={state.date.replaceAll("-", "/")} />
          {state.checks.map((item) => (
            <CheckRow key={item.label} item={item} timestamp={metaFor(checkTimestamps[item.label])} />
          ))}
          <Row label="ph値" value={state.phValue} timestamp={metaFor(fieldTimestamps.phValue)} />
          <div className="flex flex-col w-full">
            <Row label="残留塩素濃度(mg/ℓ)" value={state.residualChlorine} hideBorder />
            <ToggleRow label="塩素補充" checked={state.chlorineChecked} />
            {fieldTimestamps.residualChlorine && (
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal pb-3">
                {metaFor(fieldTimestamps.residualChlorine)}
              </p>
            )}
            <div className="border-t border-[#d0d0d0]" />
          </div>
          <div className="flex flex-col w-full">
            <Row label="UV殺菌灯稼働時間(h)" value={state.uvOperatingHours} hideBorder />
            <ToggleRow label="UV殺菌灯交換" checked={state.uvChecked} />
            {fieldTimestamps.uvOperatingHours && (
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal pb-3">
                {metaFor(fieldTimestamps.uvOperatingHours)}
              </p>
            )}
            <div className="border-t border-[#d0d0d0]" />
          </div>
          <Row
            label="UV表示灯"
            value={state.uvIndicatorOk ? "点灯" : "消灯"}
            timestamp={metaFor(fieldTimestamps.uvIndicator)}
          />
          <Row
            label="異常検出灯"
            value={state.errorIndicatorOk ? "消灯" : "点灯"}
            timestamp={metaFor(fieldTimestamps.errorIndicator)}
          />
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setShowExitDialog(true)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          保存
        </button>
      </div>

      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExitDialog(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-4 items-center w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                　未保存の項目があります
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
                入力内容が保存されていません。このまま別の画面に切り替えると、入力内容は失われます。本当に画面を切り替えますか？
              </p>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setShowExitDialog(false)}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDiscardAndLeave}
                className="bg-[var(--semantic-brand-danger)] h-16 w-60 rounded-lg text-xl text-white"
              >
                破棄して画面移動
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
