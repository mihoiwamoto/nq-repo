import { Link, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import type { CheckItem, ToggleItem } from "./mockData";
import { useWaterInspection } from "./WaterInspectionContext";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";

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
  noBorder,
  compact,
}: {
  label: string;
  value: string;
  noBorder?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between w-full ${
        compact ? "py-1" : "py-3"
      } ${noBorder ? "" : "border-b border-[#d0d0d0]"}`}
    >
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

function ToggleRow({ toggle }: { toggle: ToggleItem }) {
  if (!toggle.checked) return null;
  return (
    <div className="flex justify-end w-full py-0 pb-3">
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
        {toggle.label}
      </span>
    </div>
  );
}

export function PointDetailPage() {
  const { pointId, recordId } = useParams<{ pointId: string; recordId: string }>();
  const navigate = useNavigate();
  const { recordsByPoint } = useWaterInspection();
  const record = pointId ? recordsByPoint[pointId]?.find((r) => r.id === recordId) : undefined;
  const backToHistoryPath = `/app/ledger-list/water-inspection/points/${pointId}`;

  if (!record) {
    return (
      <>
        <AppHeader title="使用水の点検" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            まだ点検記録がありません。
          </p>
          <button
            type="button"
            onClick={() => navigate(backToHistoryPath)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            記録一覧に戻る
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title={`使用水の点検_${record.location}`}
        action={
          <Link
            to={`/app/ledger-list/water-inspection/points/${pointId}/records/${recordId}/edit`}
            className="bg-white border border-[var(--semantic-brand-primary)] flex items-center gap-2 h-11 px-3 rounded-lg shrink-0"
          >
            <img src={iconEdit} alt="編集" className="size-5" />
            <span className="text-lg text-[var(--semantic-brand-primary)]">編集</span>
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <Row label="実施者" value={record.inspector} />
          <Row label="点検場所" value={record.location} />
          <Row label="実施日" value={record.date} />
          {record.checks.map((item) => (
            <CheckRow key={item.label} item={item} />
          ))}
          <Row label="ph値" value={record.phValue} />
          <div className="flex flex-col w-full">
            <Row label="残留塩素濃度(mg/ℓ)" value={record.residualChlorine} noBorder />
            <ToggleRow toggle={record.chlorineToggle} />
            <div className="border-t border-[#d0d0d0]" />
          </div>
          <div className="flex flex-col w-full">
            <Row label="UV殺菌灯稼働時間(h)" value={record.uvOperatingHours} noBorder />
            <ToggleRow toggle={record.uvToggle} />
            <div className="border-t border-[#d0d0d0]" />
          </div>
          <Row label="UV表示灯" value={record.uvIndicatorLight} />
          <div className="h-3" />
          <Row label="異常検出灯" value={record.errorIndicatorLight} noBorder compact />
        </div>

        <Link
          to={backToHistoryPath}
          className="bg-white border border-[var(--semantic-text-primary)] flex h-16 items-center justify-center px-4 py-2 rounded-lg w-90 max-w-full"
        >
          <span className="text-xl text-[var(--semantic-text-primary)]">一覧表示に戻る</span>
        </Link>
      </div>
    </>
  );
}
