import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { AppHeader } from "../../layout/AppHeader";
import { useWaterInspection } from "./WaterInspectionContext";
import { ACTION_OPTIONS, type CheckItem, type CheckStatus } from "./mockData";

export type RecordEditFormState = {
  date: string;
  checks: CheckItem[];
  phValue: string;
  residualChlorine: string;
  chlorineChecked: boolean;
  uvOperatingHours: string;
  uvChecked: boolean;
  uvIndicatorOk: boolean;
  errorIndicatorOk: boolean;
};

const UV_ALERT_THRESHOLD = 8000;
const CHECK_LABELS = ["味", "臭い", "色", "濁り", "異物"];
const INSPECTOR_NAME = "実施者01";

function parseHours(value: string) {
  const n = Number(value.replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
}

function OkNgToggle({
  status,
  onOk,
  onNg,
  timestamp,
  inspectorName,
}: {
  status: CheckStatus;
  onOk: () => void;
  onNg: () => void;
  timestamp?: string;
  inspectorName?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center rounded-lg overflow-hidden shrink-0">
        <button
          type="button"
          onClick={onNg}
          className={`h-12 w-20 flex items-center justify-center text-white text-xl ${
            status === "ng" ? "bg-[var(--semantic-status-error)]" : "bg-[#d0d0d0]"
          }`}
        >
          <img src={iconXMark} alt="異常あり" className="size-5" />
        </button>
        <button
          type="button"
          onClick={onOk}
          className={`h-12 w-20 flex items-center justify-center text-white text-xl ${
            status === "ok" ? "bg-[var(--semantic-status-success)]" : "bg-[#d0d0d0]"
          }`}
        >
          <img src={iconCheck} alt="正常" className="size-5" />
        </button>
      </div>
      {timestamp && <p className="text-sm text-[var(--semantic-text-secondary)]">{inspectorName} {timestamp}</p>}
    </div>
  );
}

function QuestionTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="説明を表示"
        className="bg-white size-5 rounded-full border border-[var(--semantic-text-secondary)] text-[var(--semantic-text-secondary)] text-xs flex items-center justify-center shrink-0"
      >
        ?
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="説明を閉じる"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10"
          />
          <div className="absolute z-20 top-6 right-0 w-[260px] bg-[var(--semantic-brand-primary)] text-white text-sm rounded-lg p-3 shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
            {text}
          </div>
        </>
      )}
    </span>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between w-full py-3 border-b border-[#d0d0d0]">
      <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
        {label}
        <span className="text-[var(--semantic-brand-danger)] text-xs">※</span>
      </p>
      {children}
    </div>
  );
}

export function RecordEditPage() {
  const { pointId, recordId } = useParams<{ pointId: string; recordId: string }>();
  const navigate = useNavigate();
  const { recordsByPoint } = useWaterInspection();
  const original = pointId ? recordsByPoint[pointId]?.find((r) => r.id === recordId) : undefined;

  const [date, setDate] = useState(original?.date.replaceAll("/", "-") ?? "");
  const [checks, setChecks] = useState<CheckItem[]>(
    original?.checks ?? CHECK_LABELS.map((label) => ({ label, status: "ok" as CheckStatus }))
  );
  const [phValue, setPhValue] = useState(original?.phValue ?? "");
  const [residualChlorine, setResidualChlorine] = useState(original?.residualChlorine ?? "");
  const [chlorineChecked, setChlorineChecked] = useState(original?.chlorineToggle.checked ?? false);
  const [uvOperatingHours, setUvOperatingHours] = useState(original?.uvOperatingHours ?? "");
  const [uvChecked, setUvChecked] = useState(original?.uvToggle.checked ?? false);
  const [uvIndicatorOk, setUvIndicatorOk] = useState(original?.uvIndicatorLight !== "消灯");
  const [errorIndicatorOk, setErrorIndicatorOk] = useState(original?.errorIndicatorLight !== "点灯");

  const [ngTarget, setNgTarget] = useState<string | null>(null);
  const [ngStatus, setNgStatus] = useState<CheckStatus>("ng");
  const [ngCause, setNgCause] = useState("");
  const [ngAction, setNgAction] = useState<string | null>(null);
  const [ngActionOtherText, setNgActionOtherText] = useState("");

  const [checkTimestamps, setCheckTimestamps] = useState<Record<string, string>>({});

  if (!original || !pointId || !recordId) {
    return (
      <>
        <AppHeader title="使用水の点検" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            編集対象の点検記録が見つかりません。
          </p>
        </div>
      </>
    );
  }

  function updateCheck(label: string, status: CheckStatus, detail?: { cause: string; action: string }) {
    setChecks((prev) =>
      prev.map((c) =>
        c.label === label
          ? { label, status, cause: detail?.cause, action: detail?.action }
          : c
      )
    );
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    setCheckTimestamps((prev) => ({
      ...prev,
      [label]: `${year}/${month}/${day} ${hours}:${minutes}`,
    }));
  }

  function openNgDialog(label: string) {
    const existing = checks.find((c) => c.label === label);
    setNgTarget(label);
    setNgStatus("ng");
    setNgCause(existing?.cause ?? "");
    setNgAction(existing?.action ?? null);
  }

  function closeNgDialog() {
    setNgTarget(null);
  }

  function confirmNgDialog() {
    if (!ngTarget) return;
    if (ngStatus === "ng") {
      if (!ngCause.trim() || !ngAction) return;
      const action = ngAction === "その他" ? ngActionOtherText : ngAction;
      if (!action.trim()) return;
      updateCheck(ngTarget, "ng", { cause: ngCause, action });
    } else {
      updateCheck(ngTarget, "ok");
    }
    closeNgDialog();
  }

  function handleGoToConfirm() {
    const state: RecordEditFormState = {
      date,
      checks,
      phValue,
      residualChlorine,
      chlorineChecked,
      uvOperatingHours,
      uvChecked,
      uvIndicatorOk,
      errorIndicatorOk,
    };
    navigate(
      `/app/ledger-list/water-inspection/points/${pointId}/records/${recordId}/edit/confirm`,
      { state }
    );
  }

  const alertPercent = Math.min(100, (parseHours(uvOperatingHours) / UV_ALERT_THRESHOLD) * 100);

  return (
    <>
      <AppHeader title={`使用水の点検_${original.location}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <FieldRow label="実施日">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white h-12 px-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0]"
            />
          </FieldRow>

          {checks.map((item) => (
            <div key={item.label} className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)]">{item.label}</p>
                <OkNgToggle
                  status={item.status}
                  onOk={() => updateCheck(item.label, "ok")}
                  onNg={() => openNgDialog(item.label)}
                  timestamp={checkTimestamps[item.label]}
                  inspectorName={INSPECTOR_NAME}
                />
              </div>
              {item.status === "ng" && (
                <div className="flex flex-col gap-1 px-2 text-[13px] text-[var(--semantic-text-secondary)]">
                  <p>原因：{item.cause}</p>
                  <p>対応：{item.action}</p>
                </div>
              )}
            </div>
          ))}

          <FieldRow label="ph値">
            <input
              type="text"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value)}
              className="bg-white h-12 px-2 text-right rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0]"
            />
          </FieldRow>

          <div className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                残留塩素濃度(mg/ℓ)<span className="text-[var(--semantic-brand-danger)] text-xs">※</span>
              </p>
              <input
                type="text"
                value={residualChlorine}
                onChange={(e) => setResidualChlorine(e.target.value)}
                className="bg-white h-12 px-2 text-right rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0]"
              />
            </div>
            <div className="flex items-center gap-2 self-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chlorineChecked}
                  onChange={(e) => setChlorineChecked(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  chlorineChecked
                    ? 'bg-[var(--semantic-status-success)] border-[var(--semantic-status-success)]'
                    : 'border-[#d0d0d0]'
                }`}>
                  {chlorineChecked && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[var(--semantic-text-primary)]">塩素補充</span>
              </label>
              <QuestionTooltip text="塩素補充をした場合は、チェックを入れてください。" />
            </div>
            <p className="text-sm text-[var(--semantic-text-primary)] self-end">
              ※残留塩素濃度基準：0.1〜1.0mg/ℓ
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                UV殺菌灯稼働時間(h)<span className="text-[var(--semantic-brand-danger)] text-xs">※</span>
              </p>
              <input
                type="text"
                value={uvOperatingHours}
                onChange={(e) => setUvOperatingHours(e.target.value)}
                className="bg-white h-12 px-2 text-right rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0]"
              />
            </div>
            <div className="flex items-center gap-2 self-end w-[200px]">
              <span className="text-xs text-[var(--semantic-text-primary)] shrink-0">交換アラート</span>
              <div className="bg-[#d0d0d0] h-3 rounded-lg w-full overflow-hidden">
                <div
                  className="bg-[var(--semantic-status-success)] h-3 rounded-lg"
                  style={{ width: `${alertPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 self-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uvChecked}
                  onChange={(e) => setUvChecked(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  uvChecked
                    ? 'bg-[var(--semantic-status-success)] border-[var(--semantic-status-success)]'
                    : 'border-[#d0d0d0]'
                }`}>
                  {uvChecked && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[var(--semantic-text-primary)]">UV殺菌灯交換</span>
              </label>
              <QuestionTooltip text="UV殺菌灯を交換した場合は、チェックを入れると時間がリセットされます。" />
            </div>
            <p className="text-sm text-[var(--semantic-text-primary)] self-end text-right">
              ※自動計算。メーターと差分が大きい場合は手入力
              <br />
              ※UV殺菌灯稼働時間：8,000時間以内
            </p>
          </div>

          <FieldRow label="UV表示灯 点灯">
            <OkNgToggle
              status={uvIndicatorOk ? "ok" : "ng"}
              onOk={() => setUvIndicatorOk(true)}
              onNg={() => setUvIndicatorOk(false)}
            />
          </FieldRow>
          <FieldRow label="異常検出灯 消灯">
            <OkNgToggle
              status={errorIndicatorOk ? "ok" : "ng"}
              onOk={() => setErrorIndicatorOk(true)}
              onNg={() => setErrorIndicatorOk(false)}
            />
          </FieldRow>
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
          onClick={handleGoToConfirm}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          編集を保存
        </button>
      </div>

      {ngTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeNgDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-4 py-10 w-full max-w-full max-w-[1000px] mx-40 max-h-[90vh] overflow-y-auto overflow-x-hidden mx-16">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検箇所
              </h2>
              <div className="flex items-center justify-between w-full gap-4">
                <p className="text-xl text-[var(--semantic-text-primary)] flex items-center gap-1">
                  {ngTarget} <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <OkNgToggle
                  status={ngStatus}
                  onOk={() => setNgStatus("ok")}
                  onNg={() => setNgStatus("ng")}
                />
              </div>
              {ngStatus === "ng" && (
                <>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <textarea
                      value={ngCause}
                      onChange={(e) => setNgCause(e.target.value)}
                      placeholder="原因を記入してください。"
                      className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      対応 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <div className="flex flex-wrap gap-4 w-full">
                      {ACTION_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setNgAction(option);
                            if (option !== "その他") {
                              setNgActionOtherText("");
                            }
                          }}
                          className={`h-12 w-34 shrink-0 flex items-center justify-center rounded-lg text-base shadow-[0px_2px_2px_rgba(51,51,51,0.24)] ${
                            ngAction === option
                              ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                              : "bg-white text-[var(--semantic-text-primary)]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {ngAction === "その他" && (
                      <textarea
                        value={ngActionOtherText}
                        onChange={(e) => setNgActionOtherText(e.target.value)}
                        placeholder="対応内容を記入してください。"
                        className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeNgDialog}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={ngStatus === "ng" && (!ngCause.trim() || !ngAction)}
                onClick={confirmNgDialog}
                className={`h-16 w-60 rounded-lg text-xl text-white ${
                  ngStatus === "ok" || (ngCause.trim() && ngAction)
                    ? "bg-[var(--semantic-brand-primary)]"
                    : "bg-[#d0d0d0]"
                }`}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
