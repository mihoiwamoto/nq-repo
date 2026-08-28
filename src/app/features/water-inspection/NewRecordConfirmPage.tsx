import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAnnouncementBar } from "../../layout/AnnouncementBarContext";
import { useWaterInspection } from "./WaterInspectionContext";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import type { CheckItem } from "./mockData";
import type { NewRecordFormState } from "./NewRecordPage";

const INSPECTOR_NAME = "実施者01";

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

function Row({ label, value, hideBorder }: { label: string; value: string; hideBorder?: boolean }) {
  return (
    <div className={`flex items-center justify-between w-full py-3 ${!hideBorder && "border-b border-[#d0d0d0]"}`}>
      <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
      <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
    </div>
  );
}

function CheckRow({ item }: { item: CheckItem }) {
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
    </div>
  );
}

function ToggleRow({ label, checked }: { label: string; checked: boolean }) {
  if (!checked) return null;
  return (
    <div className="flex justify-end w-full pb-3 -mt-1 border-b border-[#d0d0d0]">
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

export function NewRecordConfirmPage() {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { points, recordsByPoint, addRecord } = useWaterInspection();
  const { notifyOfflineInspection } = useAnnouncementBar();
  const state = location.state as NewRecordFormState | null;

  if (!state || !pointId) {
    return (
      <>
        <AppHeader title="使用水の点検" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            点検内容が見つかりません。点検記録画面から操作してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(`/app/ledger-list/water-inspection/points/${pointId}/new`)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            点検記録画面に戻る
          </button>
        </div>
      </>
    );
  }

  const existing = recordsByPoint[pointId] ?? [];
  const pointName = points.find((p) => p.id === pointId)?.name ?? "";
  const locationName = existing[0]?.location ?? pointName;

  function handleSubmit() {
    if (!pointId || !state) return;
    addRecord(pointId, {
      inspector: INSPECTOR_NAME,
      location: locationName,
      date: state.date.replaceAll("-", "/"),
      time: new Date().toTimeString().slice(0, 5),
      checks: state.checks,
      phValue: state.phValue,
      residualChlorine: state.residualChlorine,
      chlorineToggle: { label: "塩素補充", checked: state.chlorineChecked },
      uvOperatingHours: state.uvOperatingHours,
      uvToggle: { label: "UV殺菌灯交換", checked: state.uvChecked },
      uvIndicatorLight: state.uvIndicatorOk ? "点灯" : "消灯",
      errorIndicatorLight: state.errorIndicatorOk ? "消灯" : "点灯",
    });
    if (!navigator.onLine) notifyOfflineInspection();
    navigate("/app/ledger-list/water-inspection/complete");
  }

  return (
    <>
      <AppHeader title={`使用水の点検_${locationName}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-[640px]">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>
        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-[640px]">
          <Row label="実施者" value={INSPECTOR_NAME} />
          <Row label="点検場所" value={locationName} />
          <Row label="実施日" value={state.date.replaceAll("-", "/")} />
          {state.checks.map((item) => (
            <CheckRow key={item.label} item={item} />
          ))}
          <Row label="ph値" value={state.phValue} />
          <div className="flex flex-col w-full">
            <Row label="残留塩素濃度(mg/ℓ)" value={state.residualChlorine} hideBorder />
            <ToggleRow label="塩素補充" checked={state.chlorineChecked} />
          </div>
          <div className="flex flex-col w-full">
            <Row label="UV殺菌灯稼働時間(h)" value={state.uvOperatingHours} hideBorder />
            <ToggleRow label="UV殺菌灯交換" checked={state.uvChecked} />
          </div>
          <Row label="UV表示灯" value={state.uvIndicatorOk ? "点灯" : "消灯"} />
          <Row label="異常検出灯" value={state.errorIndicatorOk ? "消灯" : "点灯"} />
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
