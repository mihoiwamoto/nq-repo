import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { recordTimestamp } from "../../utils/date";
import { isUnrecorded } from "../../utils/recordTimestamps";
import { AppHeader } from "../../layout/AppHeader";
import { AnomalyDialog } from "./AnomalyDialog";
import { PulldownSelect } from "../../components/PulldownSelect";
import { ProductSelectionDialog } from "./ProductSelectionDialog";
import iconXMark from "../../../assets/figma/icons/common/cancel.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark.svg";
import {
  ABNORMAL_ACTIONS,
  ABNORMAL_CAUSES,
  MACHINE_RECORDS,
  MACHINES,
  METAL_DETECTOR_CHECKLIST,
  METAL_DETECTOR_UNITS,
  METAL_TEST_PIECES,
  WEIGHT_CHECKER_UNITS,
  XRAY_DETECTOR_CHECKLIST,
  XRAY_DETECTOR_UNITS,
  XRAY_TEST_PIECES,
  type AbnormalAction,
  type AbnormalCause,
  type ChecklistGroup,
  type InspectionContent,
  type MachineRecord,
  type OkNg,
  type ExecutionPhase,
  type TestPieceRow,
} from "./mockData";
import iconCancelDark from "@images/Icon/cancel.svg";

function currentTimeString(inspectorName?: string) {
  const name = inspectorName || "山田太郎";
  return `${name} ${recordTimestamp()}`;
}

/**
 * 「実施者 + 入力時刻」の文字列。
 * 入力を消して未記録に戻したときは空文字を返し、時刻表示ごと消す。
 */
function timeStringFor(value: unknown, inspectorName?: string) {
  return isUnrecorded(value) ? "" : currentTimeString(inspectorName);
}

function currentTimeOnly() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  return `${hours}:${minutes}`;
}

function addMachineRecord(machineId: string, record: MachineRecord) {
  const existing = MACHINE_RECORDS[machineId] ?? [];
  MACHINE_RECORDS[machineId] = [...existing, record];
}

function newRecordId() {
  return `r${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function answeredChecks(checks: Record<string, OkNg | null>): Record<string, OkNg> {
  const result: Record<string, OkNg> = {};
  for (const [key, value] of Object.entries(checks)) {
    if (value) result[key] = value;
  }
  return result;
}

function OkNgToggle({ value, onChange, onNgClick, inspectorName, inspectionDate, time, timestamp }: { value: OkNg | null; onChange: (v: OkNg) => void; onNgClick?: () => void; inspectorName?: string; inspectionDate?: string; time?: string; timestamp?: string }) {
  return (
    <div className="flex flex-col items-end shrink-0 gap-1">
      <div className="flex items-center shrink-0 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => {
            onChange("ng");
            onNgClick?.();
          }}
          className={`h-12 w-20 flex items-center justify-center ${
            value === "ng" ? "bg-[var(--semantic-status-error)]" : "bg-[#d0d0d0]"
          }`}
        >
          <img src={iconXMark} alt="異常あり" className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onChange("ok")}
          className={`h-12 w-20 flex items-center justify-center ${
            value === "ok" ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          <img src={iconCheck} alt="正常" className="size-5 brightness-0 invert" />
        </button>
      </div>
      {timestamp && <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{timestamp}</p>}
    </div>
  );
}

const TIME_PICKER_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const TIME_PICKER_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function TimePickerInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const [hour, minute] = value ? value.split(":") : ["", ""];

  useEffect(() => {
    if (!open) return;
    hourListRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
    minuteListRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg flex items-center justify-between gap-2 text-base text-[var(--semantic-text-primary)] w-[160px]"
      >
        <span>{value || "--:--"}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <circle cx="8" cy="8" r="6.5" stroke="var(--semantic-text-secondary)" />
          <path d="M8 4.5V8L10.2 9.5" stroke="var(--semantic-text-secondary)" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-[0px_0px_3px_rgba(51,51,51,0.24)] p-2 z-50 flex gap-1">
            <div ref={hourListRef} className="flex flex-col gap-0.5 max-h-48 overflow-y-auto w-14">
              {TIME_PICKER_HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  data-selected={h === hour}
                  onClick={() => onChange(`${h}:${minute || "00"}`)}
                  className={`h-9 shrink-0 rounded-lg text-base ${
                    h === hour
                      ? "bg-[var(--semantic-brand-primary)] text-white"
                      : "text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div ref={minuteListRef} className="flex flex-col gap-0.5 max-h-48 overflow-y-auto w-14">
              {TIME_PICKER_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-selected={m === minute}
                  onClick={() => onChange(`${hour || "00"}:${m}`)}
                  className={`h-9 shrink-0 rounded-lg text-base ${
                    m === minute
                      ? "bg-[var(--semantic-brand-primary)] text-white"
                      : "text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DetectorGroup({
  label,
  unit,
  onUnitChange,
  unitOptions,
  time,
  onTimeChange,
  timeTimestamp,
  onTimeTimestampChange,
  checklist,
  checks,
  onCheckChange,
  checkTimestamps,
  onCheckTimestampChange,
  machineType,
  onAnomalyClick,
  inspectorName,
  inspectionDate,
  anomalies,
}: {
  label: string;
  unit: string;
  onUnitChange: (value: string) => void;
  unitOptions: string[];
  time: string;
  onTimeChange: (value: string) => void;
  timeTimestamp: string;
  onTimeTimestampChange: (value: string) => void;
  checklist: ChecklistGroup[];
  checks: Record<string, OkNg | null>;
  onCheckChange: (key: string, value: OkNg) => void;
  checkTimestamps: Record<string, string>;
  onCheckTimestampChange: (key: string, value: string) => void;
  machineType: "metal" | "xray";
  onAnomalyClick?: (type: "machine-record", itemName: string, machineType: "metal" | "xray", itemKey?: string) => void;
  inspectorName?: string;
  inspectionDate?: string;
  anomalies?: Record<string, { cause?: string; response: string }>;
}) {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-4 py-2 rounded-t-lg w-full">
        <p className="text-white text-lg flex items-center gap-1">
          {label} <span className="text-white text-xs">※</span>
        </p>
        <PulldownSelect value={unit} onChange={onUnitChange} options={unitOptions} />
      </div>
      <div className="bg-white flex flex-col gap-5 items-start p-4 rounded-b-lg w-full">
        <div className="flex items-center justify-between w-full">
          <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
            点検時間 <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                onTimeChange(currentTimeOnly());
                onTimeTimestampChange(currentTimeString(inspectorName));
              }}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-3 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              現在時刻
            </button>
            <TimePickerInput
              value={time}
              onChange={(v) => {
                onTimeChange(v);
                onTimeTimestampChange(timeStringFor(v, inspectorName));
              }}
            />
          </div>
        </div>
        {timeTimestamp && (
          <div className="flex items-center justify-end w-full">
            <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{timeTimestamp}</p>
          </div>
        )}
        <div className="border-t border-[#d0d0d0] w-full" />

        {checklist.map((group) => (
          <div key={group.title} className="flex flex-col gap-3 items-start w-full">
            <p className="text-xl text-[var(--semantic-brand-primary)]">{group.title}</p>
            {group.items.map((item) => (
              <div key={item.key} className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between gap-4 w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    {item.label} <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <OkNgToggle
                    value={checks[item.key] ?? null}
                    onChange={(value) => {
                      onCheckChange(item.key, value);
                      onCheckTimestampChange(item.key, currentTimeString(inspectorName));
                    }}
                    onNgClick={() => onAnomalyClick?.("machine-record", item.label, machineType, item.key)}
                    inspectionDate={inspectionDate}
                    time={time}
                    timestamp={checks[item.key] === "ng" ? undefined : checkTimestamps[item.key]}
                  />
                </div>
                {checks[item.key] === "ng" && (
                  <>
                    <div className="flex flex-col gap-1 items-start w-full ml-4">
                      <p className="text-sm text-[var(--semantic-text-secondary)]">原因：{anomalies?.[item.key]?.cause || ""}</p>
                      <p className="text-sm text-[var(--semantic-text-secondary)]">対応：{anomalies?.[item.key]?.response || ""}</p>
                    </div>
                    {checkTimestamps[item.key] && (
                      <div className="flex items-center justify-end w-full">
                        <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{checkTimestamps[item.key]}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestPieceDetectorGroup({
  label,
  unit,
  onUnitChange,
  unitOptions,
  time,
  onTimeChange,
  timeTimestamp,
  onTimeTimestampChange,
  settingNumber,
  onSettingNumberChange,
  settingNumberTimestamp,
  onSettingNumberTimestampChange,
  pieces,
  values,
  onValueChange,
  valueTimestamps,
  onValueTimestampChange,
  checks,
  onCheckChange,
  checkTimestamps,
  onCheckTimestampChange,
  inspectorName,
  onAnomalyClick,
}: {
  label: string;
  unit: string;
  onUnitChange: (value: string) => void;
  unitOptions: string[];
  time: string;
  onTimeChange: (value: string) => void;
  timeTimestamp: string;
  onTimeTimestampChange: (value: string) => void;
  settingNumber: string;
  onSettingNumberChange: (value: string) => void;
  settingNumberTimestamp: string;
  onSettingNumberTimestampChange: (value: string) => void;
  pieces: TestPieceRow[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
  valueTimestamps: Record<string, string>;
  onValueTimestampChange: (key: string, value: string) => void;
  checks: Record<string, OkNg | null>;
  onCheckChange: (key: string, value: OkNg) => void;
  checkTimestamps: Record<string, string>;
  onCheckTimestampChange: (key: string, value: string) => void;
  inspectorName?: string;
  onAnomalyClick?: (type: "test-piece" | "product", itemName: string, itemKey?: string) => void;
  anomalies?: Record<string, { cause?: string; responseType?: string; response?: string }>;
}) {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-4 py-2 rounded-t-lg w-full">
        <p className="text-white text-lg flex items-center gap-1">
          {label} <span className="text-white text-xs">※</span>
        </p>
        <PulldownSelect value={unit} onChange={onUnitChange} options={unitOptions} />
      </div>
      <div className="bg-white flex flex-col gap-5 items-start p-4 rounded-b-lg w-full">
        <div className="flex items-center justify-between w-full">
          <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
            点検時間 <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                onTimeChange(currentTimeOnly());
                onTimeTimestampChange(currentTimeString(inspectorName));
              }}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-3 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              現在時刻
            </button>
            <TimePickerInput
              value={time}
              onChange={(v) => {
                onTimeChange(v);
                onTimeTimestampChange(timeStringFor(v, inspectorName));
              }}
            />
          </div>
        </div>
        {timeTimestamp && (
          <div className="flex items-center justify-end w-full">
            <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{timeTimestamp}</p>
          </div>
        )}
        <div className="border-t border-[#d0d0d0] w-full" />

        <div className="flex items-center justify-between w-full">
          <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
            設定番号 <span className="text-[var(--semantic-brand-danger)]">※</span>
          </p>
          <input
            type="text"
            value={settingNumber}
            onChange={(e) => {
              onSettingNumberChange(e.target.value);
              onSettingNumberTimestampChange(timeStringFor(e.target.value, inspectorName));
            }}
            placeholder="例：1"
            className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[160px] placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>
        {settingNumberTimestamp && (
          <div className="flex items-center justify-end w-full">
            <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{settingNumberTimestamp}</p>
          </div>
        )}
        <div className="border-t border-[#d0d0d0] w-full" />

        {pieces.map((piece, index) => (
          <div key={piece.key} className="flex flex-col gap-3 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                テストピース：{piece.label} <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={values[piece.key] ?? ""}
                onChange={(e) => {
                  onValueChange(piece.key, e.target.value);
                  onValueTimestampChange(piece.key, timeStringFor(e.target.value, inspectorName));
                }}
                placeholder={`例：${piece.example}`}
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[160px] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            {valueTimestamps[piece.key] && (
              <div className="flex items-center justify-end w-full">
                <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{valueTimestamps[piece.key]}</p>
              </div>
            )}
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                検知確認：{piece.label} <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <OkNgToggle
                value={checks[piece.key] ?? null}
                onChange={(value) => {
                  onCheckChange(piece.key, value);
                  onCheckTimestampChange(piece.key, currentTimeString(inspectorName));
                }}
                onNgClick={() => onAnomalyClick?.("test-piece", piece.label, piece.key)}
                timestamp={checkTimestamps[piece.key]}
              />
            </div>
            {index < pieces.length - 1 && <div className="border-t border-[#d0d0d0] w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MachineRecordFormPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { inspectionDate?: string; inspectorName?: string; content?: InspectionContent; fromProgress?: boolean }
    | null;
  const content = state?.content ?? "動作確認";
  const inspectorName = state?.inspectorName ?? "";
  const machine = MACHINES.find((m) => m.id === machineId);

  const [metalUnit, setMetalUnit] = useState(METAL_DETECTOR_UNITS[0]);
  const [xrayUnit, setXrayUnit] = useState(XRAY_DETECTOR_UNITS[0]);
  const [weightCheckerUnit, setWeightCheckerUnit] = useState(WEIGHT_CHECKER_UNITS[0]);

  const [metalTime, setMetalTime] = useState("");
  const [metalTimeTimestamp, setMetalTimeTimestamp] = useState("");
  const [metalChecks, setMetalChecks] = useState<Record<string, OkNg | null>>({});
  const [metalCheckTimestamps, setMetalCheckTimestamps] = useState<Record<string, string>>({});
  const [xrayTime, setXrayTime] = useState("");
  const [xrayTimeTimestamp, setXrayTimeTimestamp] = useState("");
  const [xrayChecks, setXrayChecks] = useState<Record<string, OkNg | null>>({});
  const [xrayCheckTimestamps, setXrayCheckTimestamps] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");

  const [executionPhase, setExecutionPhase] = useState<ExecutionPhase>("開始");
  const [passedProducts, setPassedProducts] = useState<string[]>([]);
  const [metalSettingNumber, setMetalSettingNumber] = useState("");
  const [metalSettingNumberTimestamp, setMetalSettingNumberTimestamp] = useState("");
  const [metalPieceValues, setMetalPieceValues] = useState<Record<string, string>>({});
  const [metalPieceTimestamps, setMetalPieceTimestamps] = useState<Record<string, string>>({});
  const [metalPieceChecks, setMetalPieceChecks] = useState<Record<string, OkNg | null>>({});
  const [metalPieceCheckTimestamps, setMetalPieceCheckTimestamps] = useState<Record<string, string>>({});
  const [xraySettingNumber, setXraySettingNumber] = useState("");
  const [xraySettingNumberTimestamp, setXraySettingNumberTimestamp] = useState("");
  const [xrayPieceValues, setXrayPieceValues] = useState<Record<string, string>>({});
  const [xrayPieceTimestamps, setXrayPieceTimestamps] = useState<Record<string, string>>({});
  const [xrayPieceChecks, setXrayPieceChecks] = useState<Record<string, OkNg | null>>({});
  const [xrayPieceCheckTimestamps, setXrayPieceCheckTimestamps] = useState<Record<string, string>>({});
  const [passedQuantity, setPassedQuantity] = useState("");
  const [passedQuantityTimestamp, setPassedQuantityTimestamp] = useState("");
  const [weightCheckerTimestamp, setWeightCheckerTimestamp] = useState("");

  const [passExecutionPhase, setPassExecutionPhase] = useState<ExecutionPhase>("開始");
  const [passExecutionPhaseTimestamp, setPassExecutionPhaseTimestamp] = useState("");
  const [passProducts, setPassProducts] = useState<string[]>([]);
  const [passQuantity, setPassQuantity] = useState("");
  const [weightCheckerTime, setWeightCheckerTime] = useState("");
  const [weightLowerLimit, setWeightLowerLimit] = useState("");
  const [weightLowerLimitTimestamp, setWeightLowerLimitTimestamp] = useState("");
  const [weightCalibrationCheck, setWeightCalibrationCheck] = useState<OkNg | null>(null);
  const [weightCalibrationAnomaly, setWeightCalibrationAnomaly] = useState<{ cause?: string; response: string } | null>(null);
  const [weightPackageMatchCheck, setWeightPackageMatchCheck] = useState<OkNg | null>(null);
  const [weightPackageMatchAnomaly, setWeightPackageMatchAnomaly] = useState<{ cause?: string; response: string } | null>(null);
  const [sealingTime, setSealingTime] = useState("");
  const [sealingTimeTimestamp, setSealingTimeTimestamp] = useState("");
  const [sealingCheck, setSealingCheck] = useState<OkNg | null>(null);
  const [sealingAnomaly, setSealingAnomaly] = useState<{ cause?: string; response: string } | null>(null);
  const [weightCalibrationTimestamp, setWeightCalibrationTimestamp] = useState("");
  const [weightPackageMatchTimestamp, setWeightPackageMatchTimestamp] = useState("");
  const [sealingTimestamp, setSealingTimestamp] = useState("");

  const [abnormalTime, setAbnormalTime] = useState("");
  const [abnormalTimeTimestamp, setAbnormalTimeTimestamp] = useState("");
  const [abnormalProducts, setAbnormalProducts] = useState<string[]>([]);
  const [abnormalPassedQuantityTimestamp, setAbnormalPassedQuantityTimestamp] = useState("");
  const [abnormalPassedQuantity, setAbnormalPassedQuantity] = useState("");
  const [abnormalQuantityTimestamp, setAbnormalQuantityTimestamp] = useState("");
  const [abnormalQuantity, setAbnormalQuantity] = useState("");
  const [abnormalCause, setAbnormalCause] = useState<AbnormalCause>("異物混入");
  const [abnormalCauseNote, setAbnormalCauseNote] = useState("");
  const [abnormalCauseNoteTimestamp, setAbnormalCauseNoteTimestamp] = useState("");
  const [abnormalAction, setAbnormalAction] = useState<AbnormalAction>("点検調整");
  const [abnormalActionNote, setAbnormalActionNote] = useState("");
  const [abnormalActionNoteTimestamp, setAbnormalActionNoteTimestamp] = useState("");

  const [metalAnomalies, setMetalAnomalies] = useState<Record<string, { cause?: string; response: string }>>({});
  const [xrayAnomalies, setXrayAnomalies] = useState<Record<string, { cause?: string; response: string }>>({});

  const [metalPieceAnomalies, setMetalPieceAnomalies] = useState<Record<string, { cause?: string; responseType?: string; response: string }>>({});
  const [xrayPieceAnomalies, setXrayPieceAnomalies] = useState<Record<string, { cause?: string; responseType?: string; response: string }>>({});

  const [anomalyDialog, setAnomalyDialog] = useState<{
    isOpen: boolean;
    type: "machine-record" | "test-piece" | "product";
    itemName: string;
    machineType?: "metal" | "xray";
    itemKey?: string;
    onConfirmCallback?: () => void;
  } | null>(null);

  const [productSelection, setProductSelection] = useState<{
    isOpen: boolean;
    type: "pass" | "abnormal" | "test-piece";
  }>({
    isOpen: false,
    type: "pass",
  });

  if (!machine) return null;

  useEffect(() => {
    if (anomalyDialog?.isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    };
  }, [anomalyDialog?.isOpen]);

  useEffect(() => {
    if (state?.fromProgress) {
      setMetalUnit(METAL_DETECTOR_UNITS[0]);
      setXrayUnit(XRAY_DETECTOR_UNITS[0]);
      setWeightCheckerUnit(WEIGHT_CHECKER_UNITS[0]);
      setMetalTime("");
      setMetalTimeTimestamp("");
      setMetalChecks({});
      setMetalCheckTimestamps({});
      setXrayTime("");
      setXrayTimeTimestamp("");
      setXrayChecks({});
      setXrayCheckTimestamps({});
      setRemarks("");
      setExecutionPhase("開始");
      setPassedProducts([]);
      setMetalSettingNumber("");
      setMetalSettingNumberTimestamp("");
      setMetalPieceValues({});
      setMetalPieceTimestamps({});
      setMetalPieceChecks({});
      setMetalPieceCheckTimestamps({});
      setXraySettingNumber("");
      setXraySettingNumberTimestamp("");
      setXrayPieceValues({});
      setXrayPieceTimestamps({});
      setXrayPieceChecks({});
      setXrayPieceCheckTimestamps({});
      setPassedQuantity("");
      setPassedQuantityTimestamp("");
      setWeightCheckerTimestamp("");
      setPassExecutionPhase("開始");
      setPassExecutionPhaseTimestamp("");
      setPassProducts([]);
      setPassQuantity("");
      setWeightCheckerTime("");
      setWeightLowerLimit("");
      setWeightLowerLimitTimestamp("");
      setWeightCalibrationCheck(null);
      setWeightCalibrationAnomaly(null);
      setWeightPackageMatchCheck(null);
      setWeightPackageMatchAnomaly(null);
      setSealingTime("");
      setSealingTimeTimestamp("");
      setSealingCheck(null);
      setSealingAnomaly(null);
      setWeightCalibrationTimestamp("");
      setWeightPackageMatchTimestamp("");
      setSealingTimestamp("");
      setAbnormalTime("");
      setAbnormalTimeTimestamp("");
      setAbnormalProducts([]);
      setAbnormalPassedQuantityTimestamp("");
      setAbnormalPassedQuantity("");
      setAbnormalQuantityTimestamp("");
      setAbnormalQuantity("");
      setAbnormalCause("異物混入");
      setAbnormalCauseNote("");
      setAbnormalCauseNoteTimestamp("");
      setAbnormalAction("点検調整");
      setAbnormalActionNote("");
      setAbnormalActionNoteTimestamp("");
      setMetalAnomalies({});
      setXrayAnomalies({});
      setMetalPieceAnomalies({});
      setXrayPieceAnomalies({});
    }
  }, [state?.fromProgress]);

  const basePath = `/app/ledger-list/metal-xray-detection`;
  const listPath = `${basePath}/machines/${machineId}`;
  const confirmPath = `${basePath}/machines/${machineId}/confirm`;

  const isFormValid = () => {
    if (content === "製品通過") {
      const hasChecks = weightCalibrationCheck !== null || weightPackageMatchCheck !== null || sealingCheck !== null;
      const hasData = remarks.trim() !== "" || passProducts.length > 0 || weightCheckerTime !== "" || sealingTime !== "" || passQuantity !== "";
      return hasChecks || hasData;
    }

    const hasMetalData = metalTime !== "" || Object.values(metalChecks).some(v => v !== null) || Object.values(metalPieceValues).some(v => v !== "");
    const hasXrayData = xrayTime !== "" || Object.values(xrayChecks).some(v => v !== null) || Object.values(xrayPieceValues).some(v => v !== "");
    const hasOtherData = remarks.trim() !== "";

    return hasMetalData || hasXrayData || hasOtherData;
  };

  if (content === "製品通過") {
    const showStartChecklist = passExecutionPhase === "開始";
    return (
      <>
        <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <div className="bg-white flex flex-col gap-3 items-start p-4 rounded-lg w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">点検内容</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{content}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施区分</p>
                <div className="flex gap-2 items-center">
                  {(["開始", "終了"] as const).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => {
                        setPassExecutionPhase(phase);
                        setPassExecutionPhaseTimestamp(currentTimeString());
                      }}
                      className={`h-10 w-20 rounded-lg text-sm border ${
                        passExecutionPhase === phase
                          ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
              {passExecutionPhaseTimestamp && (
                <div className="flex items-center justify-end w-full">
                  <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">
                    {inspectorName && `${inspectorName} `}{passExecutionPhaseTimestamp}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  通過製品 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <button
                  type="button"
                  onClick={() => setProductSelection({ isOpen: true, type: "pass" })}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg flex items-center gap-1 text-base text-[var(--semantic-brand-primary)]"
                >
                  ＋ 製品追加
                </button>
              </div>
              {passProducts.length === 0 ? (
                <div className="bg-white flex items-center p-4 rounded-lg w-full">
                  <p className="text-sm text-[var(--semantic-text-primary)]">登録された製品がありません</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-start w-full">
                  {passProducts.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center w-full">
                      <input
                        type="text"
                        value={product}
                        onChange={(e) =>
                          setPassProducts((prev) => prev.map((p, i) => (i === index ? e.target.value : p)))
                        }
                        placeholder="製品名を入力"
                        className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setPassProducts((prev) => prev.filter((_, i) => i !== index))}
                        className="text-[var(--semantic-text-secondary)] text-xl px-2"
                        aria-label="削除"
                      >
                        <img src={iconCancelDark} alt="" aria-hidden="true" className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {passExecutionPhase === "終了" && (
              <>
                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)]">通過数量</p>
                  <input
                    type="text"
                    value={passQuantity}
                    onChange={(e) => {
                      setPassQuantity(e.target.value);
                      setPassedQuantityTimestamp(timeStringFor(e.target.value, inspectorName));
                    }}
                    placeholder="例：100"
                    className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[160px] placeholder:text-[var(--semantic-text-secondary)]"
                  />
                </div>
                {passedQuantityTimestamp && (
                  <div className="flex items-center justify-end w-full">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{passedQuantityTimestamp}</p>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col items-start w-full">
              <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-4 py-2 rounded-t-lg w-full">
                <p className="text-white text-lg flex items-center gap-1">
                  ウェイトチェッカー <span className="text-white text-xs">※</span>
                </p>
                <PulldownSelect
                  value={weightCheckerUnit}
                  onChange={setWeightCheckerUnit}
                  options={WEIGHT_CHECKER_UNITS}
                />
              </div>
              <div className="bg-white flex flex-col gap-5 items-start p-4 rounded-b-lg w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    点検時間 <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setWeightCheckerTime(currentTimeOnly());
                        setWeightCheckerTimestamp(currentTimeString(inspectorName));
                      }}
                      className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-3 rounded-lg text-base text-[var(--semantic-brand-primary)]"
                    >
                      現在時刻
                    </button>
                    <TimePickerInput
                      value={weightCheckerTime}
                      onChange={(v) => {
                        setWeightCheckerTime(v);
                        setWeightCheckerTimestamp(timeStringFor(v, inspectorName));
                      }}
                    />
                  </div>
                </div>
                {weightCheckerTimestamp && (
                  <div className="flex items-center justify-end w-full">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{weightCheckerTimestamp}</p>
                  </div>
                )}
                <div className="border-t border-[#d0d0d0] w-full" />

                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    重量下限値（g） <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <input
                    type="text"
                    value={weightLowerLimit}
                    onChange={(e) => {
                      setWeightLowerLimit(e.target.value);
                      setWeightLowerLimitTimestamp(timeStringFor(e.target.value, inspectorName));
                    }}
                    placeholder="例：100"
                    className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[160px] placeholder:text-[var(--semantic-text-secondary)]"
                  />
                </div>
                {weightLowerLimitTimestamp && (
                  <div className="flex items-center justify-end w-full">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{weightLowerLimitTimestamp}</p>
                  </div>
                )}

                {showStartChecklist && (
                  <>
                    <div className="border-t border-[#d0d0d0] w-full" />
                    <div className="flex flex-col gap-3 items-start w-full">
                      <p className="text-xl text-[var(--semantic-brand-primary)]">動作確認</p>
                      <div className="flex items-center justify-between w-full">
                        <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                          分銅を乗せての校正点検 <span className="text-[var(--semantic-brand-danger)]">※</span>
                        </p>
                        <OkNgToggle
                          value={weightCalibrationCheck}
                          onChange={(v) => {
                            setWeightCalibrationCheck(v);
                            setWeightCalibrationTimestamp(currentTimeString(inspectorName));
                          }}
                          onNgClick={() => setAnomalyDialog({ isOpen: true, type: "machine-record", itemName: "分銲を乗せての校正点検" })}
                          timestamp={weightCalibrationCheck === "ng" ? undefined : weightCalibrationTimestamp}
                        />
                      </div>
                      {weightCalibrationAnomaly && (
                        <div className="flex flex-col gap-1 items-start w-full ml-4">
                          {weightCalibrationAnomaly.cause && (
                            <p className="text-sm text-[var(--semantic-text-secondary)]">原因：{weightCalibrationAnomaly.cause}</p>
                          )}
                          <p className="text-sm text-[var(--semantic-text-secondary)]">対応：{weightCalibrationAnomaly.response}</p>
                        </div>
                      )}
                      {weightCalibrationCheck === "ng" && weightCalibrationTimestamp && (
                        <div className="flex items-center justify-end w-full">
                          <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{weightCalibrationTimestamp}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full">
                        <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                          通過させる製品のパッケージ（印字）との照合{" "}
                          <span className="text-[var(--semantic-brand-danger)]">※</span>
                        </p>
                        <OkNgToggle
                          value={weightPackageMatchCheck}
                          onChange={(v) => {
                            setWeightPackageMatchCheck(v);
                            setWeightPackageMatchTimestamp(currentTimeString(inspectorName));
                          }}
                          onNgClick={() => setAnomalyDialog({ isOpen: true, type: "machine-record", itemName: "通過させる製品のパッケージ（印字）との照合" })}
                          timestamp={weightPackageMatchCheck === "ng" ? undefined : weightPackageMatchTimestamp}
                        />
                      </div>
                      {weightPackageMatchAnomaly && (
                        <div className="flex flex-col gap-1 items-start w-full ml-4">
                          {weightPackageMatchAnomaly.cause && (
                            <p className="text-sm text-[var(--semantic-text-secondary)]">原因：{weightPackageMatchAnomaly.cause}</p>
                          )}
                          <p className="text-sm text-[var(--semantic-text-secondary)]">対応：{weightPackageMatchAnomaly.response}</p>
                        </div>
                      )}
                      {weightPackageMatchCheck === "ng" && weightPackageMatchTimestamp && (
                        <div className="flex items-center justify-end w-full">
                          <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{weightPackageMatchTimestamp}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start w-full">
              <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-4 py-2 rounded-t-lg w-full">
                <p className="text-white text-lg">シーリング</p>
                <div className="opacity-0 pointer-events-none bg-white h-12 w-60 rounded-lg" />
              </div>
              <div className="bg-white flex flex-col gap-5 items-start p-4 rounded-b-lg w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    点検時間 <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSealingTime(currentTimeOnly());
                        setSealingTimeTimestamp(currentTimeString(inspectorName));
                      }}
                      className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-3 rounded-lg text-base text-[var(--semantic-brand-primary)]"
                    >
                      現在時刻
                    </button>
                    <TimePickerInput
                      value={sealingTime}
                      onChange={(v) => {
                        setSealingTime(v);
                        setSealingTimeTimestamp(timeStringFor(v, inspectorName));
                      }}
                    />
                  </div>
                </div>
                {sealingTimeTimestamp && (
                  <div className="flex items-center justify-end w-full">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{sealingTimeTimestamp}</p>
                  </div>
                )}
                <div className="border-t border-[#d0d0d0] w-full" />

                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    動作確認 <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <OkNgToggle
                    value={sealingCheck}
                    onChange={(v) => {
                      setSealingCheck(v);
                      setSealingTimestamp(currentTimeString(inspectorName));
                    }}
                    onNgClick={() => setAnomalyDialog({ isOpen: true, type: "machine-record", itemName: "シーリング" })}
                    timestamp={sealingCheck === "ng" ? undefined : sealingTimestamp}
                  />
                </div>
                {sealingAnomaly && (
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-sm text-[var(--semantic-text-primary)]">原因：{sealingAnomaly.cause}</p>
                    <p className="text-sm text-[var(--semantic-text-primary)]">対応：{sealingAnomaly.response}</p>
                  </div>
                )}
                {sealingCheck === "ng" && sealingTimestamp && (
                  <div className="flex items-center justify-end w-full">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{sealingTimestamp}</p>
                  </div>
                )}
              </div>
            </div>

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

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            一覧へ戻る
          </button>
          <button
            type="button"
            disabled={!isFormValid()}
            onClick={() => {
              const checks = [weightCalibrationCheck, weightPackageMatchCheck, sealingCheck];
              addMachineRecord(machine.id, {
                id: newRecordId(),
                category: passExecutionPhase,
                time: weightCheckerTime || sealingTime,
                content,
                passedProduct: passProducts.join("、"),
                result: checks.includes("ng") ? "NG" : "OK",
                remarks,
                inspectorName,
                productPassDetail: {
                  passQuantity,
                  weightCheckerUnit,
                  weightCheckerTime,
                  weightLowerLimit,
                  weightCalibrationCheck,
                  weightPackageMatchCheck,
                  sealingTime,
                  sealingCheck,
                },
              });
              navigate(confirmPath, { state: { inspectionDate: state?.inspectionDate, inspectorName: state?.inspectorName, hideAddButton: true, fromProgress: state?.fromProgress } });
            }}
            className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
              isFormValid()
                ? "bg-[var(--semantic-brand-primary)] cursor-pointer"
                : "bg-[#d0d0d0] cursor-not-allowed"
            }`}
          >
            保存
          </button>
        </div>

        <ProductSelectionDialog
          isOpen={productSelection.isOpen}
          onClose={() => setProductSelection({ ...productSelection, isOpen: false })}
          onConfirm={(products) => {
            const productNames = products.map((p) => p.name);
            if (productSelection.type === "pass") {
              setPassProducts((prev) => [...prev, ...productNames]);
            } else if (productSelection.type === "test-piece") {
              setPassedProducts((prev) => [...prev, ...productNames]);
            } else if (productSelection.type === "abnormal") {
              setAbnormalProducts((prev) => [...prev, ...productNames]);
            }
            setProductSelection({ ...productSelection, isOpen: false });
          }}
          availableProducts={[]}
        />
        {anomalyDialog && (
          <AnomalyDialog
            isOpen={anomalyDialog.isOpen}
            type={anomalyDialog.type}
            itemName={anomalyDialog.itemName}
            machineName="ウエイトチェッカー"
            onClose={() => setAnomalyDialog(null)}
            onConfirm={(_data) => {
              if (anomalyDialog.itemName === "分銲を乗せての校正点検") {
                if (_data.inspectionResult === "ok") {
                  setWeightCalibrationCheck("ok");
                  setWeightCalibrationAnomaly(null);
                } else {
                  setWeightCalibrationCheck("ng");
                  setWeightCalibrationAnomaly({ cause: _data.cause, response: _data.response });
                }
              } else if (anomalyDialog.itemName === "通過させる製品のパッケージ（印字）との照合") {
                if (_data.inspectionResult === "ok") {
                  setWeightPackageMatchCheck("ok");
                  setWeightPackageMatchAnomaly(null);
                } else {
                  setWeightPackageMatchCheck("ng");
                  setWeightPackageMatchAnomaly({ cause: _data.cause, response: _data.response });
                }
              } else if (anomalyDialog.itemName === "シーリング") {
                if (_data.inspectionResult === "ok") {
                  setSealingCheck("ok");
                  setSealingAnomaly(null);
                } else {
                  setSealingCheck("ng");
                  setSealingAnomaly({ cause: _data.cause, response: _data.response });
                }
              }
              setAnomalyDialog(null);
            }}
          />
        )}
      </>
    );
  }

  if (content === "テストピース") {
    return (
      <>
        <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <div className="bg-white flex flex-col gap-3 items-start p-4 rounded-lg w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">点検内容</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{content}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施区分</p>
                <div className="flex gap-2 items-center">
                  {(["開始", "終了"] as const).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setExecutionPhase(phase)}
                      className={`h-10 w-20 rounded-lg text-sm border ${
                        executionPhase === phase
                          ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)]">通過製品/カテゴリ</p>
                <button
                  type="button"
                  onClick={() => setProductSelection({ isOpen: true, type: "test-piece" })}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg flex items-center gap-1 text-base text-[var(--semantic-brand-primary)]"
                >
                  ＋ 製品追加
                </button>
              </div>
              {passedProducts.length === 0 ? (
                <div className="bg-white flex items-center p-4 rounded-lg w-full">
                  <p className="text-sm text-[var(--semantic-text-primary)]">登録された製品がありません</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-start w-full">
                  {passedProducts.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center w-full">
                      <input
                        type="text"
                        value={product}
                        onChange={(e) =>
                          setPassedProducts((prev) =>
                            prev.map((p, i) => (i === index ? e.target.value : p))
                          )
                        }
                        placeholder="製品名/カテゴリを入力"
                        className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setPassedProducts((prev) => prev.filter((_, i) => i !== index))}
                        className="text-[var(--semantic-text-secondary)] text-xl px-2"
                        aria-label="削除"
                      >
                        <img src={iconCancelDark} alt="" aria-hidden="true" className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <TestPieceDetectorGroup
              label="金属探知機"
              unit={metalUnit}
              onUnitChange={setMetalUnit}
              unitOptions={METAL_DETECTOR_UNITS}
              time={metalTime}
              onTimeChange={setMetalTime}
              timeTimestamp={metalTimeTimestamp}
              onTimeTimestampChange={setMetalTimeTimestamp}
              settingNumber={metalSettingNumber}
              onSettingNumberChange={setMetalSettingNumber}
              settingNumberTimestamp={metalSettingNumberTimestamp}
              onSettingNumberTimestampChange={setMetalSettingNumberTimestamp}
              pieces={METAL_TEST_PIECES}
              values={metalPieceValues}
              onValueChange={(key, value) => setMetalPieceValues((prev) => ({ ...prev, [key]: value }))}
              valueTimestamps={metalPieceTimestamps}
              onValueTimestampChange={(key, value) => setMetalPieceTimestamps((prev) => ({ ...prev, [key]: value }))}
              checks={metalPieceChecks}
              onCheckChange={(key, value) => setMetalPieceChecks((prev) => ({ ...prev, [key]: value }))}
              checkTimestamps={metalPieceCheckTimestamps}
              onCheckTimestampChange={(key, value) => setMetalPieceCheckTimestamps((prev) => ({ ...prev, [key]: value }))}
              inspectorName={inspectorName}
              onAnomalyClick={(type, itemName, itemKey) => setAnomalyDialog({ isOpen: true, type, itemName, itemKey, machineType: "metal" })}
              anomalies={metalPieceAnomalies}
            />

            <TestPieceDetectorGroup
              label="X線探知機"
              unit={xrayUnit}
              onUnitChange={setXrayUnit}
              unitOptions={XRAY_DETECTOR_UNITS}
              time={xrayTime}
              onTimeChange={setXrayTime}
              timeTimestamp={xrayTimeTimestamp}
              onTimeTimestampChange={setXrayTimeTimestamp}
              settingNumber={xraySettingNumber}
              onSettingNumberChange={setXraySettingNumber}
              settingNumberTimestamp={xraySettingNumberTimestamp}
              onSettingNumberTimestampChange={setXraySettingNumberTimestamp}
              pieces={XRAY_TEST_PIECES}
              values={xrayPieceValues}
              onValueChange={(key, value) => setXrayPieceValues((prev) => ({ ...prev, [key]: value }))}
              valueTimestamps={xrayPieceTimestamps}
              onValueTimestampChange={(key, value) => setXrayPieceTimestamps((prev) => ({ ...prev, [key]: value }))}
              checks={xrayPieceChecks}
              onCheckChange={(key, value) => setXrayPieceChecks((prev) => ({ ...prev, [key]: value }))}
              checkTimestamps={xrayPieceCheckTimestamps}
              onCheckTimestampChange={(key, value) => setXrayPieceCheckTimestamps((prev) => ({ ...prev, [key]: value }))}
              inspectorName={inspectorName}
              onAnomalyClick={(type, itemName, itemKey) => setAnomalyDialog({ isOpen: true, type, itemName, itemKey, machineType: "xray" })}
              anomalies={xrayPieceAnomalies}
            />

            {executionPhase === "終了" && (
              <>
                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)]">通過数量</p>
                  <input
                    type="text"
                    value={passedQuantity}
                    onChange={(e) => {
                      setPassedQuantity(e.target.value);
                      setPassedQuantityTimestamp(timeStringFor(e.target.value, inspectorName));
                    }}
                    placeholder="例：100"
                    className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[160px] placeholder:text-[var(--semantic-text-secondary)]"
                  />
                </div>
                {passedQuantityTimestamp && (
                  <div className="flex items-center justify-end w-full">
                    <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{passedQuantityTimestamp}</p>
                  </div>
                )}
              </>
            )}

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

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            一覧へ戻る
          </button>
          <button
            type="button"
            onClick={() => {
              const checks = [...Object.values(metalPieceChecks), ...Object.values(xrayPieceChecks)];
              addMachineRecord(machine.id, {
                id: newRecordId(),
                category: executionPhase,
                time: metalTime || xrayTime,
                content,
                passedProduct: passedProducts.join("、"),
                result: checks.includes("ng") ? "NG" : "OK",
                remarks,
                inspectorName,
                testPieceDetail: {
                  metalUnit,
                  metalTime,
                  metalSettingNumber,
                  metalPieceValues,
                  metalPieceChecks: answeredChecks(metalPieceChecks),
                  metalPieceAnomalyNotes: metalPieceAnomalies,
                  xrayUnit,
                  xrayTime,
                  xraySettingNumber,
                  xrayPieceValues,
                  xrayPieceChecks: answeredChecks(xrayPieceChecks),
                  xrayPieceAnomalyNotes: xrayPieceAnomalies,
                },
              });
              navigate(confirmPath, { state: { inspectionDate: state?.inspectionDate, inspectorName: state?.inspectorName, hideAddButton: true, fromProgress: state?.fromProgress } });
            }}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            保存
          </button>
        </div>

        {anomalyDialog && (
          <AnomalyDialog
            isOpen={anomalyDialog.isOpen}
            type={anomalyDialog.type}
            itemName={anomalyDialog.itemName}
            machineType={anomalyDialog.machineType}
            machineName={machine?.name}
            onClose={() => setAnomalyDialog(null)}
            onConfirm={(_data) => {
              console.log("🔥 MachineRecordFormPage onConfirm called");
              if (anomalyDialog?.type === "machine-record" && anomalyDialog?.itemKey && anomalyDialog?.machineType) {
                console.log("🔥 machine-record detected, itemKey:", anomalyDialog.itemKey);
                if (_data.inspectionResult === "ng") {
                  console.log("🔥 Setting ng for", anomalyDialog.itemKey, "with cause:", _data.cause);
                  if (anomalyDialog.machineType === "metal") {
                    const newKey = anomalyDialog.itemKey as string;
                    setMetalChecks((prev) => {
                      const updated = { ...prev, [newKey]: "ng" };
                      console.log("🔥 metalChecks updated:", updated);
                      return updated;
                    });
                    setMetalAnomalies((prev) => {
                      const updated = { ...prev, [newKey]: { cause: _data.cause, response: _data.response } };
                      console.log("🔥 metalAnomalies updated:", updated);
                      return updated;
                    });
                  } else {
                    const newKey = anomalyDialog.itemKey as string;
                    setXrayChecks((prev) => {
                      const updated = { ...prev, [newKey]: "ng" };
                      console.log("🔥 xrayChecks updated:", updated);
                      return updated;
                    });
                    setXrayAnomalies((prev) => {
                      const updated = { ...prev, [newKey]: { cause: _data.cause, response: _data.response } };
                      console.log("🔥 xrayAnomalies updated:", updated);
                      return updated;
                    });
                  }
                }
              } else if (anomalyDialog?.type === "test-piece" && anomalyDialog?.itemKey && anomalyDialog?.machineType) {
                if (_data.inspectionResult === "ok") {
                  if (anomalyDialog.machineType === "metal") {
                    setMetalPieceChecks((prev) => ({ ...prev, [anomalyDialog.itemKey as string]: "ok" }));
                  } else {
                    setXrayPieceChecks((prev) => ({ ...prev, [anomalyDialog.itemKey as string]: "ok" }));
                  }
                } else if (_data.inspectionResult === "ng") {
                  if (anomalyDialog.machineType === "metal") {
                    setMetalPieceChecks((prev) => ({ ...prev, [anomalyDialog.itemKey as string]: "ng" }));
                    setMetalPieceAnomalies((prev) => ({ ...prev, [anomalyDialog.itemKey as string]: { cause: _data.cause || "", responseType: _data.responseType || "inspection", response: _data.response || "" } }));
                  } else {
                    setXrayPieceChecks((prev) => ({ ...prev, [anomalyDialog.itemKey as string]: "ng" }));
                    setXrayPieceAnomalies((prev) => ({ ...prev, [anomalyDialog.itemKey as string]: { cause: _data.cause || "", responseType: _data.responseType || "inspection", response: _data.response || "" } }));
                  }
                }
              }
              setAnomalyDialog(null);
            }}
          />
        )}

        <ProductSelectionDialog
          isOpen={productSelection.isOpen}
          onClose={() => setProductSelection({ ...productSelection, isOpen: false })}
          onConfirm={(products) => {
            const productNames = products.map((p) => p.name);
            if (productSelection.type === "pass") {
              setPassProducts((prev) => [...prev, ...productNames]);
            } else if (productSelection.type === "test-piece") {
              setPassedProducts((prev) => [...prev, ...productNames]);
            } else if (productSelection.type === "abnormal") {
              setAbnormalProducts((prev) => [...prev, ...productNames]);
            }
            setProductSelection({ ...productSelection, isOpen: false });
          }}
          availableProducts={[]}
        />
      </>
    );
  }

  if (content === "異常反応") {
    return (
      <>
        <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">点検内容</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{content}</p>
            </div>

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                点検時間 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={abnormalTime}
                onChange={(e) => {
                  setAbnormalTime(e.target.value);
                  setAbnormalTimeTimestamp(timeStringFor(e.target.value, inspectorName));
                }}
                placeholder="例：10:30"
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            {abnormalTimeTimestamp && (
              <div className="flex items-center justify-end w-full">
                <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{abnormalTimeTimestamp}</p>
              </div>
            )}
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-3 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  異常製品 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <button
                  type="button"
                  onClick={() => setProductSelection({ isOpen: true, type: "abnormal" })}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg flex items-center gap-1 text-base text-[var(--semantic-brand-primary)]"
                >
                  ＋ 製品追加
                </button>
              </div>
              {abnormalProducts.length === 0 ? (
                <div className="bg-white flex items-center p-4 rounded-lg w-full">
                  <p className="text-sm text-[var(--semantic-text-primary)]">登録された製品がありません</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-start w-full">
                  {abnormalProducts.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center w-full">
                      <input
                        type="text"
                        value={product}
                        onChange={(e) =>
                          setAbnormalProducts((prev) =>
                            prev.map((p, i) => (i === index ? e.target.value : p))
                          )
                        }
                        placeholder="製品名を入力"
                        className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setAbnormalProducts((prev) => prev.filter((_, i) => i !== index))}
                        className="text-[var(--semantic-text-secondary)] text-xl px-2"
                        aria-label="削除"
                      >
                        <img src={iconCancelDark} alt="" aria-hidden="true" className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                通過数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={abnormalPassedQuantity}
                onChange={(e) => {
                  setAbnormalPassedQuantity(e.target.value);
                  setAbnormalPassedQuantityTimestamp(timeStringFor(e.target.value, inspectorName));
                }}
                placeholder="例：100"
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            {abnormalPassedQuantityTimestamp && (
              <div className="flex items-center justify-end w-full">
                <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{abnormalPassedQuantityTimestamp}</p>
              </div>
            )}
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                異常数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={abnormalQuantity}
                onChange={(e) => {
                  setAbnormalQuantity(e.target.value);
                  setAbnormalQuantityTimestamp(timeStringFor(e.target.value, inspectorName));
                }}
                placeholder="例：1"
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            {abnormalQuantityTimestamp && (
              <div className="flex items-center justify-end w-full">
                <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{abnormalQuantityTimestamp}</p>
              </div>
            )}
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex flex-wrap gap-4 w-full">
                {ABNORMAL_CAUSES.map((cause) => (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => setAbnormalCause(cause)}
                    className={`h-12 w-34 rounded-lg text-base border ${
                      abnormalCause === cause
                        ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "bg-white border-[#d0d0d0] text-[#333]"
                    }`}
                  >
                    {cause}
                  </button>
                ))}
              </div>
              <textarea
                value={abnormalCauseNote}
                onChange={(e) => {
                  setAbnormalCauseNote(e.target.value);
                  setAbnormalCauseNoteTimestamp(timeStringFor(e.target.value, inspectorName));
                }}
                placeholder="原因を記入してください。"
                className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
              {abnormalCauseNoteTimestamp && (
                <div className="flex items-center justify-end w-full">
                  <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{abnormalCauseNoteTimestamp}</p>
                </div>
              )}
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                対応 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex flex-wrap gap-4 w-full">
                {ABNORMAL_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setAbnormalAction(action)}
                    className={`h-12 w-34 rounded-lg text-base border ${
                      abnormalAction === action
                        ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "bg-white border-[#d0d0d0] text-[#333]"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
              <textarea
                value={abnormalActionNote}
                onChange={(e) => {
                  setAbnormalActionNote(e.target.value);
                  setAbnormalActionNoteTimestamp(timeStringFor(e.target.value, inspectorName));
                }}
                placeholder="対応を記入してください。"
                className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
              {abnormalActionNoteTimestamp && (
                <div className="flex items-center justify-end w-full">
                  <p className="text-sm font-normal text-[var(--semantic-text-secondary)]">{abnormalActionNoteTimestamp}</p>
                </div>
              )}
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

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            一覧へ戻る
          </button>
          <button
            type="button"
            onClick={() => {
              addMachineRecord(machine.id, {
                id: newRecordId(),
                category: "ー",
                time: abnormalTime,
                content,
                passedProduct: abnormalProducts.join("、"),
                result: "NG",
                remarks,
                inspectorName,
                abnormalDetail: {
                  passedQuantity: abnormalPassedQuantity,
                  abnormalQuantity,
                  abnormalCause,
                  abnormalCauseNote,
                  abnormalAction,
                  abnormalActionNote,
                },
              });
              navigate(confirmPath, { state: { inspectionDate: state?.inspectionDate, inspectorName: state?.inspectorName, hideAddButton: true, fromProgress: state?.fromProgress } });
            }}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            保存
          </button>
        </div>

        <ProductSelectionDialog
          isOpen={productSelection.isOpen}
          onClose={() => setProductSelection({ ...productSelection, isOpen: false })}
          onConfirm={(products) => {
            const productNames = products.map((p) => p.name);
            if (productSelection.type === "pass") {
              setPassProducts((prev) => [...prev, ...productNames]);
            } else if (productSelection.type === "test-piece") {
              setPassedProducts((prev) => [...prev, ...productNames]);
            } else if (productSelection.type === "abnormal") {
              setAbnormalProducts((prev) => [...prev, ...productNames]);
            }
            setProductSelection({ ...productSelection, isOpen: false });
          }}
          availableProducts={[]}
        />
      </>
    );
  }

  return (
    <>
      <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
        <div className="flex flex-col gap-5 items-start w-full max-w-full">
          <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">点検内容</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{content}</p>
          </div>

          <DetectorGroup
            label="金属探知機"
            unit={metalUnit}
            onUnitChange={setMetalUnit}
            unitOptions={METAL_DETECTOR_UNITS}
            time={metalTime}
            onTimeChange={setMetalTime}
            timeTimestamp={metalTimeTimestamp}
            onTimeTimestampChange={setMetalTimeTimestamp}
            checklist={METAL_DETECTOR_CHECKLIST}
            checks={metalChecks}
            onCheckChange={(key, value) => setMetalChecks((prev) => ({ ...prev, [key]: value }))}
            checkTimestamps={metalCheckTimestamps}
            onCheckTimestampChange={(key, value) => setMetalCheckTimestamps((prev) => ({ ...prev, [key]: value }))}
            machineType="metal"
            onAnomalyClick={(type, itemName, machineType, itemKey) => {
              setAnomalyDialog({
                isOpen: true,
                type,
                itemName,
                machineType,
                itemKey,
                onConfirmCallback: itemKey ? () => setMetalChecks((prev) => ({ ...prev, [itemKey]: "ok" })) : undefined
              });
            }}
            inspectorName={inspectorName}
            inspectionDate={state?.inspectionDate}
            anomalies={metalAnomalies}
          />

          <DetectorGroup
            label="X線探知機"
            unit={xrayUnit}
            onUnitChange={setXrayUnit}
            unitOptions={XRAY_DETECTOR_UNITS}
            time={xrayTime}
            onTimeChange={setXrayTime}
            timeTimestamp={xrayTimeTimestamp}
            onTimeTimestampChange={setXrayTimeTimestamp}
            checklist={XRAY_DETECTOR_CHECKLIST}
            checks={xrayChecks}
            onCheckChange={(key, value) => setXrayChecks((prev) => ({ ...prev, [key]: value }))}
            checkTimestamps={xrayCheckTimestamps}
            onCheckTimestampChange={(key, value) => setXrayCheckTimestamps((prev) => ({ ...prev, [key]: value }))}
            inspectorName={inspectorName}
            inspectionDate={state?.inspectionDate}
            machineType="xray"
            onAnomalyClick={(type, itemName, machineType, itemKey) => {
              setAnomalyDialog({
                isOpen: true,
                type,
                itemName,
                machineType,
                itemKey,
                onConfirmCallback: itemKey ? () => setXrayChecks((prev) => ({ ...prev, [itemKey]: "ok" })) : undefined
              });
            }}
            anomalies={xrayAnomalies}
          />

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

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(listPath)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          一覧へ戻る
        </button>
        <button
          type="button"
          onClick={() => {
            const checks = [...Object.values(metalChecks), ...Object.values(xrayChecks)];
            addMachineRecord(machine.id, {
              id: newRecordId(),
              category: "ー",
              time: metalTime || xrayTime,
              content,
              passedProduct: "",
              result: checks.includes("ng") ? "NG" : "OK",
              remarks,
              inspectorName,
              detail: {
                metalUnit,
                metalTime,
                metalChecks: answeredChecks(metalChecks),
                metalAnomalyNotes: metalAnomalies,
                xrayUnit,
                xrayTime,
                xrayChecks: answeredChecks(xrayChecks),
                xrayAnomalyNotes: xrayAnomalies,
              },
            });
            navigate(confirmPath, { state: { inspectionDate: state?.inspectionDate, inspectorName: state?.inspectorName, hideAddButton: true, fromProgress: state?.fromProgress } });
          }}
          className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
        >
          保存
        </button>
      </div>

      <ProductSelectionDialog
        isOpen={productSelection.isOpen}
        onClose={() => setProductSelection({ ...productSelection, isOpen: false })}
        onConfirm={(products) => {
          const productNames = products.map((p) => p.name);
          if (productSelection.type === "pass") {
            setPassProducts((prev) => [...prev, ...productNames]);
          } else if (productSelection.type === "test-piece") {
            setPassedProducts((prev) => [...prev, ...productNames]);
          } else if (productSelection.type === "abnormal") {
            setAbnormalProducts((prev) => [...prev, ...productNames]);
          }
          setProductSelection({ ...productSelection, isOpen: false });
        }}
        availableProducts={[]}
      />

      {anomalyDialog && (
        <AnomalyDialog
          isOpen={anomalyDialog.isOpen}
          type={anomalyDialog.type}
          itemName={anomalyDialog.itemName}
          machineType={anomalyDialog.machineType}
          machineName={machine?.name}
          onClose={() => setAnomalyDialog(null)}
          onConfirm={(data) => {
            console.log("onConfirm data:", data);
            console.log("anomalyDialog:", anomalyDialog);
            if (anomalyDialog?.itemKey && anomalyDialog?.machineType) {
              const itemKey = anomalyDialog.itemKey as string;
              if (anomalyDialog.type === "test-piece") {
                if (data.inspectionResult === "ok") {
                  if (anomalyDialog.machineType === "metal") {
                    setMetalPieceChecks((prev) => ({ ...prev, [itemKey]: "ok" }));
                  } else {
                    setXrayPieceChecks((prev) => ({ ...prev, [itemKey]: "ok" }));
                  }
                } else if (data.inspectionResult === "ng") {
                  if (anomalyDialog.machineType === "metal") {
                    setMetalPieceChecks((prev) => ({ ...prev, [itemKey]: "ng" }));
                    setMetalPieceAnomalies((prev) => ({ ...prev, [itemKey]: { cause: data.cause || "", responseType: data.responseType || "inspection", response: data.response || "" } }));
                  } else {
                    setXrayPieceChecks((prev) => ({ ...prev, [itemKey]: "ng" }));
                    setXrayPieceAnomalies((prev) => ({ ...prev, [itemKey]: { cause: data.cause || "", responseType: data.responseType || "inspection", response: data.response || "" } }));
                  }
                }
              } else {
                if (data.inspectionResult === "ok") {
                  if (anomalyDialog.machineType === "metal") {
                    setMetalChecks((prev) => ({ ...prev, [itemKey]: "ok" }));
                  } else {
                    setXrayChecks((prev) => ({ ...prev, [itemKey]: "ok" }));
                  }
                } else if (data.inspectionResult === "ng") {
                  if (anomalyDialog.machineType === "metal") {
                    setMetalChecks((prev) => ({ ...prev, [itemKey]: "ng" }));
                    setMetalAnomalies((prev) => ({ ...prev, [itemKey]: { cause: data.cause || "", response: data.response || "" } }));
                  } else {
                    setXrayChecks((prev) => ({ ...prev, [itemKey]: "ng" }));
                    setXrayAnomalies((prev) => ({ ...prev, [itemKey]: { cause: data.cause || "", response: data.response || "" } }));
                  }
                }
              }
            }
            setAnomalyDialog(null);
          }}
        />
      )}
    </>
  );
}
