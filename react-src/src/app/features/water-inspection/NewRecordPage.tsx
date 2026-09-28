import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { DateFilterInput } from "../../components/DateFilterInput";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { todayString } from "../../utils/date";
import { isUnrecorded, stampTimestamps } from "../../utils/recordTimestamps";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { useWaterInspection } from "./WaterInspectionContext";
import {
  ACTION_OPTIONS,
  type CheckItem,
  type CheckStatus,
  type WaterInspectionRecord,
} from "./mockData";

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
      {timestamp && <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{inspectorName} {timestamp}</p>}
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

function FieldRow({
  label,
  children,
  inspectorName,
  timestamp,
}: {
  label: string;
  children: React.ReactNode;
  inspectorName?: string;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full py-3 border-b border-[#d0d0d0]">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
          {label}
          <span className="text-[var(--semantic-brand-danger)] text-xs">※</span>
        </p>
        {children}
      </div>
      <RecordTimestamp inspector={inspectorName} timestamp={timestamp} />
    </div>
  );
}

export type NewRecordFormState = {
  date: string;
  checks: CheckItem[];
  phValue: string;
  residualChlorine: string;
  chlorineChecked: boolean;
  uvOperatingHours: string;
  uvChecked: boolean;
  uvIndicatorOk: boolean;
  errorIndicatorOk: boolean;
  /** 実施者名と、項目ごとの入力時刻。確認画面でも同じタイムスタンプを出すために渡す */
  inspectorName?: string;
  checkTimestamps?: Record<string, string>;
  fieldTimestamps?: Record<string, string>;
};

export function NewRecordPage() {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { points, recordsByPoint } = useWaterInspection();
  // 進捗一覧で選んだ実施者名。直接この画面を開いたときは既定の実施者にする
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? INSPECTOR_NAME;

  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const point = points.find((p) => p.id === pointId);
  const pointFill: RecordFill = point?.status === "not_inspected" ? "none" : "full";
  const fill = progressFill ?? pointFill;
  // 点検済みのときはその点検場所の直近の記録を入れた状態で出す
  const latest: WaterInspectionRecord | undefined =
    fill === "none" ? undefined : (recordsByPoint[pointId ?? ""] ?? [])[0];
  // 点検中は五感チェックの前半だけ記録した「記録途中」の状態にする
  const seededChecks = latest ? fillSlice(latest.checks, fill) : [];

  const [date, setDate] = useState(latest?.date.replaceAll("/", "-") ?? todayString());
  const [checks, setChecks] = useState<CheckItem[]>(
    CHECK_LABELS.map((label) => seededChecks.find((c) => c.label === label) ?? { label, status: null as any })
  );
  const [phValue, setPhValue] = useState(fill === "full" ? latest?.phValue ?? "" : "");
  const [residualChlorine, setResidualChlorine] = useState(fill === "full" ? latest?.residualChlorine ?? "" : "");
  const [chlorineChecked, setChlorineChecked] = useState(
    fill === "full" ? latest?.chlorineToggle.checked ?? false : false
  );
  const [uvOperatingHours, setUvOperatingHours] = useState(fill === "full" ? latest?.uvOperatingHours ?? "" : "");
  const [uvChecked, setUvChecked] = useState(fill === "full" ? latest?.uvToggle.checked ?? false : false);
  const [uvIndicatorOk, setUvIndicatorOk] = useState(
    fill === "full" && latest ? latest.uvIndicatorLight === "点灯" : true
  );
  const [errorIndicatorOk, setErrorIndicatorOk] = useState(
    fill === "full" && latest ? latest.errorIndicatorLight === "消灯" : true
  );

  const [ngTarget, setNgTarget] = useState<string | null>(null);
  const [ngStatus, setNgStatus] = useState<CheckStatus>("ng");
  const [ngCause, setNgCause] = useState("");
  const [ngAction, setNgAction] = useState<string | null>(null);
  const [ngActionOtherText, setNgActionOtherText] = useState("");

  const [checkTimestamps, setCheckTimestamps] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      seededChecks
        .filter((check) => !isUnrecorded(check.status))
        .map((check) => [check.label, `${latest?.date} ${latest?.time}`])
    )
  );
  /** 五感チェック以外の測定値も、項目ごとに「いつ入力したか」を持たせる。
   *  値が入っていない項目は未記録なので、入力時刻も出さない */
  const [fieldTimestamps, setFieldTimestamps] = useState<Record<string, string>>(() =>
    fill === "full" && latest
      ? Object.fromEntries(
          (
            [
              ["phValue", latest.phValue],
              ["residualChlorine", latest.residualChlorine],
              ["uvOperatingHours", latest.uvOperatingHours],
              ["uvIndicator", latest.uvIndicatorLight],
              ["errorIndicator", latest.errorIndicatorLight],
            ] as const
          )
            .filter(([, value]) => !isUnrecorded(value))
            .map(([field]) => [field, `${latest.date} ${latest.time}`])
        )
      : {}
  );

  /** 値が入っていれば入力時刻を打ち、消して未記録に戻したら時刻表示も消す */
  function stamp(field: string, value: unknown) {
    setFieldTimestamps((prev) => stampTimestamps(prev, field, value));
  }

  function updateCheck(label: string, status: CheckStatus, detail?: { cause: string; action: string }) {
    setChecks((prev) =>
      prev.map((c) =>
        c.label === label
          ? { label, status, cause: detail?.cause, action: detail?.action }
          : c
      )
    );
    setCheckTimestamps((prev) => stampTimestamps(prev, label, status));
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

  /**
   * 何か 1 つでも記録したか。実施日は今日の日付が自動で入るので数えない。
   * 測定値と表示灯は、値が入ったときだけ fieldTimestamps に入る（消すと消える）ので
   * そのまま「入力したか」の判定に使える。
   */
  const hasInput =
    checks.some((check) => !isUnrecorded(check.status)) ||
    Object.keys(fieldTimestamps).length > 0 ||
    chlorineChecked ||
    uvChecked;
  const canProceed = date !== "" && hasInput;

  function handleGoToConfirm() {
    if (!canProceed) return;
    const state: NewRecordFormState = {
      date,
      checks,
      phValue,
      residualChlorine,
      chlorineChecked,
      uvOperatingHours,
      uvChecked,
      uvIndicatorOk,
      errorIndicatorOk,
      inspectorName,
      checkTimestamps,
      fieldTimestamps,
    };
    navigate(`/app/ledger-list/water-inspection/points/${pointId}/new/confirm`, { state });
  }

  const alertPercent = Math.min(100, (parseHours(uvOperatingHours) / UV_ALERT_THRESHOLD) * 100);

  return (
    <>
      <AppHeader title="使用水の点検_点検記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full">
          <FieldRow label="実施日">
            <DateFilterInput value={date} onChange={setDate} />
          </FieldRow>

          {checks.map((item) => (
            <div key={item.label} className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)]">{item.label}</p>
                <OkNgToggle
                  status={item.status}
                  onOk={() => updateCheck(item.label, "ok")}
                  onNg={() => openNgDialog(item.label)}
                  timestamp={item.status === "ng" ? undefined : checkTimestamps[item.label]}
                  inspectorName={inspectorName}
                />
              </div>
              {item.status === "ng" && (
                <>
                  <div className="flex flex-col gap-1 px-2 text-base text-[var(--semantic-text-secondary)]">
                    <p>原因：{item.cause}</p>
                    <p>対応：{item.action}</p>
                  </div>
                  <RecordTimestamp
                    inspector={inspectorName}
                    timestamp={checkTimestamps[item.label]}
                  />
                </>
              )}
            </div>
          ))}

          <FieldRow label="ph値" inspectorName={inspectorName} timestamp={fieldTimestamps.phValue}>
            <input
              type="text"
              value={phValue}
              onChange={(e) => {
                setPhValue(e.target.value);
                stamp("phValue", e.target.value);
              }}
              placeholder="6.5"
              className="bg-white h-12 px-2 text-right rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0] placeholder:text-[var(--semantic-text-secondary)]"
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
                onChange={(e) => {
                  setResidualChlorine(e.target.value);
                  stamp("residualChlorine", e.target.value);
                }}
                placeholder="0.5"
                className="bg-white h-12 px-2 text-right rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            <div className="flex items-center gap-2 self-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chlorineChecked}
                  onChange={(e) => {
                    setChlorineChecked(e.target.checked);
                    stamp("residualChlorine", residualChlorine);
                  }}
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
            <RecordTimestamp inspector={inspectorName} timestamp={fieldTimestamps.residualChlorine} />
          </div>

          <div className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                UV殺菌灯稼働時間(h)<span className="text-[var(--semantic-brand-danger)] text-xs">※</span>
              </p>
              <input
                type="text"
                value={uvOperatingHours}
                onChange={(e) => {
                  setUvOperatingHours(e.target.value);
                  stamp("uvOperatingHours", e.target.value);
                }}
                placeholder="4000"
                className="bg-white h-12 px-2 text-right rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] border border-[#d0d0d0] placeholder:text-[var(--semantic-text-secondary)]"
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
                  onChange={(e) => {
                    setUvChecked(e.target.checked);
                    stamp("uvOperatingHours", uvOperatingHours);
                  }}
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
            <RecordTimestamp inspector={inspectorName} timestamp={fieldTimestamps.uvOperatingHours} />
          </div>

          <FieldRow
            label="UV表示灯 点灯"
            inspectorName={inspectorName}
            timestamp={fieldTimestamps.uvIndicator}
          >
            <OkNgToggle
              status={uvIndicatorOk ? "ok" : "ng"}
              onOk={() => {
                setUvIndicatorOk(true);
                stamp("uvIndicator", "ok");
              }}
              onNg={() => {
                setUvIndicatorOk(false);
                stamp("uvIndicator", "ng");
              }}
            />
          </FieldRow>
          <FieldRow
            label="異常検出灯 消灯"
            inspectorName={inspectorName}
            timestamp={fieldTimestamps.errorIndicator}
          >
            <OkNgToggle
              status={errorIndicatorOk ? "ok" : "ng"}
              onOk={() => {
                setErrorIndicatorOk(true);
                stamp("errorIndicator", "ok");
              }}
              onNg={() => {
                setErrorIndicatorOk(false);
                stamp("errorIndicator", "ng");
              }}
            />
          </FieldRow>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={handleGoToConfirm}
          className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
            canProceed ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          確認画面へ
        </button>
      </div>

      {ngTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeNgDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-4 py-10 w-full max-w-full mx-6 md:mx-16 lg:mx-40 max-h-[90vh] overflow-y-auto overflow-x-hidden">
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
                    <div className="flex gap-4 w-full">
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
                          className={`h-12 w-34 min-w-0 flex-1 max-w-34 flex items-center justify-center rounded-lg px-2 text-base whitespace-nowrap shadow-[0px_2px_2px_rgba(51,51,51,0.24)] ${
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
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={ngStatus === "ng" && (!ngCause.trim() || !ngAction)}
                onClick={confirmNgDialog}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
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
