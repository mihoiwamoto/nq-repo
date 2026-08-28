import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconArrowDown from "../../../assets/figma/icons/common/arrow-down.svg";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import iconExpand from "../../../assets/figma/icons/common/expansion.svg";
import iconReduce from "../../../assets/figma/icons/common/reduction.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { PENDING_REVIEWS } from "../../data/pendingReviews";
import {
  FREQUENCY_LABELS,
  inspectionPoints,
  initialRecords,
  initialRemarks,
  lines,
  type InspectionItemRecord,
} from "../equipment-inspection/mockData";
import { recordsByPoint, type CheckItem } from "../water-inspection/mockData";
import {
  cleaningPoints,
  lines as cleaningLines,
  pendingReviewRecords,
  initialRemarks as cleaningInitialRemarks,
} from "../cleaning-record/mockData";
import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import {
  floors as glassPlasticFloors,
  initialInspectionRecords as glassPlasticRecords,
  rooms as glassPlasticRooms,
  REPAIR_STATUS_COLORS,
  REPAIR_STATUS_LABELS,
  REPAIR_STATUS_ORDER,
  type RepairStatus,
} from "../glass-plastic/mockData";
import {
  additives,
  initialRecords as initialAdditiveRecords,
} from "../additive-management/mockData";
import {
  pendingReviewPost as scalePendingReviewPost,
  pendingReviewScales,
  SCALE_REPAIR_STATUS_COLORS,
  SCALE_REPAIR_STATUS_LABELS,
  SCALE_REPAIR_STATUS_NEXT_OPTIONS,
  type ScaleRepairStatus,
} from "../scale-inspection/mockData";
import { SAMPLE_REVIEW_DETAILS, SAMPLE_TYPE_LABELS } from "../sample-management/mockData";
import {
  CRITERIA,
  pendingReviewProduct,
  pendingReviewScoreRows,
  type ScoreRow,
} from "../sensory-inspection/mockData";
import {
  MACHINES,
  MACHINE_INSPECTION_DATES,
  MACHINE_RECORDS,
  MACHINE_REJECTION_COMMENTS,
  METAL_DETECTOR_CHECKLIST,
  RESULT_COLORS,
  RESULT_LABELS,
  XRAY_DETECTOR_CHECKLIST,
  type ChecklistGroup,
  type OkNg,
} from "../metal-xray-detection/mockData";
import { ACTORS } from "../progress/mockData";

const EQUIPMENT_CONFIRMERS = [
  { id: "1689923", name: "鈴木翔人" },
  { id: "1958473", name: "辻原由貴" },
  { id: "1846289", name: "伊藤裕太" },
];

const CLEANING_CONFIRMERS = [
  { id: "1035921", name: "加藤由美" },
  { id: "1058473", name: "鈴木雅人" },
  { id: "1046289", name: "伊藤裕太" },
];

const GLASS_PLASTIC_CONFIRMERS = [
  { id: "1078462", name: "中村彩香" },
  { id: "1092837", name: "藤田健太" },
  { id: "1064523", name: "小川美穂" },
];

const ADDITIVE_CONFIRMERS = [
  { id: "3041587", name: "山本真理" },
  { id: "2758463", name: "渡辺誠一" },
  { id: "3192706", name: "小林幸恵" },
];

const SCALE_CONFIRMERS = [
  { id: "2214587", name: "岡本さゆり" },
  { id: "2298431", name: "村上健二" },
  { id: "2276104", name: "石井美穂" },
];

const SENSORY_CONFIRMERS = [
  { id: "2531478", name: "小野寺薫" },
  { id: "2547903", name: "堤幸雄" },
  { id: "2569012", name: "森田千夏" },
];

const METAL_XRAY_CONFIRMERS = [
  { id: "2103458", name: "西村千夏" },
  { id: "2117623", name: "橋本大輔" },
  { id: "2129804", name: "松井理沙" },
];

const METAL_XRAY_REVIEW_COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "category", label: "実施区分", width: 72 },
  { key: "time", label: "点検時間", width: 104 },
  { key: "content", label: "点検内容", width: 104 },
  { key: "passedProduct", label: "通過製品", width: 200 },
  { key: "result", label: "結果", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
  { key: "inspectorName", label: "実施者", width: 112 },
] as const;

function MetalXrayChecklistGroup({
  label,
  unit,
  checklist,
  checks,
  timestamp,
}: {
  label: string;
  unit: string;
  checklist: ChecklistGroup[];
  checks: Record<string, OkNg>;
  timestamp: string;
}) {
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-2 py-2 rounded-lg w-full">
        <p className="text-base font-semibold text-white">{label}</p>
        <p className="text-base font-semibold text-white">{unit}</p>
      </div>
      <div className="flex flex-col gap-3 items-start px-2 w-full">
        {checklist.map((group) => {
          const items = group.items.filter((item) => checks[item.key]);
          if (items.length === 0) return null;
          return (
            <div key={group.title} className="flex flex-col gap-3 items-start w-full">
              <p className="text-base text-[var(--semantic-brand-primary)]">{group.title}</p>
              {items.map((item) => (
                <div key={item.key} className="flex flex-col gap-2 items-end w-full">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">{item.label}</p>
                    <span
                      className="h-6 shrink-0 px-2 rounded-lg text-xs text-white inline-flex items-center justify-center"
                      style={{ backgroundColor: RESULT_COLORS[checks[item.key] === "ok" ? "OK" : "NG"] }}
                    >
                      {RESULT_LABELS[checks[item.key] === "ok" ? "OK" : "NG"]}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">{timestamp}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ADDITIVE_RECORD_COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 80 },
  { key: "quantity", label: "数量", width: 80 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
  { key: "actor", label: "実施者", width: 104 },
] as const;

function RepairStatusDropdown({
  value,
  onChange,
}: {
  value: RepairStatus;
  onChange: (value: RepairStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-8 px-3 rounded-lg flex items-center gap-1 text-sm text-white"
        style={{ backgroundColor: REPAIR_STATUS_COLORS[value] }}
      >
        {REPAIR_STATUS_LABELS[value]}
        <img src={iconArrowDown} alt="" className="size-3 shrink-0 [filter:brightness(0)_invert(1)]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-[0px_2px_3px_rgba(51,51,51,0.24)] overflow-hidden z-20 w-32">
            {REPAIR_STATUS_ORDER.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
              >
                {REPAIR_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ScaleRepairStatusDropdown({
  value,
  onChange,
}: {
  value: ScaleRepairStatus;
  onChange: (value: ScaleRepairStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = SCALE_REPAIR_STATUS_NEXT_OPTIONS[value];
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-8 px-3 rounded-lg flex items-center gap-1 text-sm text-white"
        style={{ backgroundColor: SCALE_REPAIR_STATUS_COLORS[value] }}
      >
        {SCALE_REPAIR_STATUS_LABELS[value]}
        <img src={iconArrowDown} alt="" className="size-3 shrink-0 [filter:brightness(0)_invert(1)]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-[0px_2px_3px_rgba(51,51,51,0.24)] overflow-hidden z-20 w-32">
            {options.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
              >
                {SCALE_REPAIR_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GlassPlasticMap({ floorName }: { floorName: string }) {
  const [mapScale, setMapScale] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);
  return (
    <div
      className={`relative bg-[#d0d0d0] border border-[var(--semantic-brand-primary)] rounded-lg overflow-auto w-full max-w-full max-w-[480px] mx-40 ${
        mapExpanded ? "h-[640px]" : "h-[340px] flex items-center justify-center"
      }`}
    >
      <button
        type="button"
        onClick={() => setMapExpanded((expanded) => !expanded)}
        aria-label={mapExpanded ? "縮小表示" : "拡大表示"}
        className="absolute top-4 left-4 size-10 bg-[var(--semantic-brand-primary)] rounded-lg flex items-center justify-center text-white text-lg z-10"
      >
        <img src={mapExpanded ? iconReduce : iconExpand} alt={mapExpanded ? "縮小" : "拡大"} className="size-6" />
      </button>
      <img
        src={floorMapImage}
        alt={`${floorName}の配置図`}
        style={{ transform: `scale(${mapScale})` }}
        className={`transition-transform ${mapExpanded ? "" : "max-h-[300px]"}`}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
        <button
          type="button"
          onClick={() => setMapScale((s) => Math.min(s + 0.2, 2))}
          className="bg-[var(--semantic-brand-primary)] w-10 h-10 flex items-center justify-center text-xl text-white border-b border-[#d0d0d0]"
        >
          <img src={iconPlus} alt="拡大" className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => setMapScale((s) => Math.max(s - 0.2, 0.6))}
          className="bg-[var(--semantic-brand-primary)] w-10 h-10 flex items-center justify-center text-xl text-white"
        >
          <img src={iconMinus} alt="縮小" className="size-6" />
        </button>
      </div>
    </div>
  );
}

function ScaleDash() {
  return <span className="inline-block w-3 h-px bg-[#333] mx-auto" />;
}

function ScaleActionCheckBadge({ value }: { value: "ok" | "ng" | null }) {
  if (value === "ok") {
    return (
      <span className="size-6 flex items-center justify-center text-[var(--semantic-status-success)] text-lg mx-auto">
        <img src={iconCheck} alt="正常" className="size-4" />
      </span>
    );
  }
  if (value === "ng") {
    return (
      <span className="size-6 rounded flex items-center justify-center bg-[#f85c5c] text-white text-sm mx-auto">
        <img src={iconXMark} alt="異常あり" className="size-3" />
      </span>
    );
  }
  return null;
}

function ScaleCheckBadge({ checked }: { checked: boolean }) {
  if (!checked) return null;
  return (
    <span className="size-6 flex items-center justify-center text-[var(--semantic-status-success)] text-lg mx-auto">
      <img src={iconCheck} alt="確認" className="size-4" />
    </span>
  );
}

function ScaleStatusTag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

const SENSORY_TABLE_COLUMNS = [
  { key: "op", label: "操作", width: 80 },
  { key: "inspector", label: "実施者", width: 180 },
  ...CRITERIA.map((c) => ({ key: c, label: c, width: 68 })),
] as const;

function sensoryAverage(rows: ScoreRow[], criterion: (typeof CRITERIA)[number]) {
  const total = rows.reduce((sum, row) => sum + row.scores[criterion].score, 0);
  return (total / rows.length).toFixed(1);
}

function sensoryOverallResult(rows: ScoreRow[]): "pass" | "fail" {
  const hasFailingScore = rows.some((row) => CRITERIA.some((c) => row.scores[c].score <= 2));
  return hasFailingScore ? "fail" : "pass";
}

const SCALE_TABLE_COLUMNS = [
  { key: "op", label: "操作", width: 80 },
  { key: "label", label: "秤No.(ラベル名)", width: 204 },
  { key: "serial", label: "シリアルナンバー", width: 128 },
  { key: "action", label: "動作\n確認", width: 60 },
  { key: "level", label: "水平\n点検", width: 60 },
  { key: "dirt", label: "汚れ", width: 60 },
  { key: "display", label: "秤の\n表示値(g)", width: 80 },
] as const;

function CompleteCheckmark() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[var(--semantic-brand-primary)]">
      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" />
      <path
        d="M24 41L34 51L56 29"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TAB_LABEL = { start: "始業", end: "終業" } as const;

function keyFor(location: string, item: string) {
  return `${location}|${item}`;
}

function StatusTag({ status }: { status: InspectionItemRecord["status"] }) {
  if (status === "ng") {
    return (
      <span className="bg-[#f85c5c] flex h-6 w-16 items-center justify-center rounded-lg text-xs text-white">
        異常あり
      </span>
    );
  }
  return (
    <span className="bg-[#19c95f] flex h-6 w-16 items-center justify-center rounded-lg text-xs text-white">
      正常
    </span>
  );
}

function WaterStatusTag({ status }: { status: CheckItem["status"] }) {
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

function WaterConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between w-full py-3 border-b border-[#d0d0d0]">
      <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
      <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
    </div>
  );
}

function WaterCheckRow({ item }: { item: CheckItem }) {
  return (
    <div className="flex flex-col gap-2 w-full py-3 border-b border-[#d0d0d0]">
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{item.label}</p>
        <WaterStatusTag status={item.status} />
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

function WaterToggleRow({ label, checked }: { label: string; checked: boolean }) {
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

export function PendingReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const review = PENDING_REVIEWS.find((r) => r.id === id);
  const isCleaningLedger = review?.ledgerSlug === "cleaning-record";
  const isGlassPlasticLedger = review?.ledgerSlug === "glass-plastic";
  const isAdditiveLedger = review?.ledgerSlug === "additive-management";
  const isScaleInspectionLedger = review?.ledgerSlug === "scale-inspection";
  const isSensoryLedger = review?.ledgerSlug === "sensory-inspection";
  const isMetalXrayLedger = review?.ledgerSlug === "metal-xray-detection";
  const CONFIRMERS = isCleaningLedger
    ? CLEANING_CONFIRMERS
    : isGlassPlasticLedger
      ? GLASS_PLASTIC_CONFIRMERS
      : isAdditiveLedger
        ? ADDITIVE_CONFIRMERS
        : isScaleInspectionLedger
          ? SCALE_CONFIRMERS
          : isSensoryLedger
            ? SENSORY_CONFIRMERS
            : isMetalXrayLedger
              ? METAL_XRAY_CONFIRMERS
              : EQUIPMENT_CONFIRMERS;
  const commentMaxLength =
    isCleaningLedger || isAdditiveLedger || isScaleInspectionLedger || isSensoryLedger || isMetalXrayLedger
      ? 255
      : 200;

  const [step, setStep] = useState<
    | "confirmer"
    | "detail"
    | "repair"
    | "record"
    | "scaleDetail"
    | "scoreDetail"
    | "machineRecordDetail"
    | "confirmation"
    | "complete"
  >("confirmer");
  const [confirmerId, setConfirmerId] = useState(CONFIRMERS[0].id);
  const [selectedAdditiveRecordId, setSelectedAdditiveRecordId] = useState<string | null>(null);
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
  const [scaleComment, setScaleComment] = useState("");
  const [selectedScoreRowId, setSelectedScoreRowId] = useState<string | null>(null);
  const [selectedMachineRecordId, setSelectedMachineRecordId] = useState<string | null>(null);
  const [metalXrayComment, setMetalXrayComment] = useState("");
  const [metalXrayActorPickerOpen, setMetalXrayActorPickerOpen] = useState(false);
  const [selectedMetalXrayActorId, setSelectedMetalXrayActorId] = useState(ACTORS[0].id);
  const [metalXrayNewComment, setMetalXrayNewComment] = useState("");
  const [metalXrayExtraComments, setMetalXrayExtraComments] = useState<
    { id: string; authorName: string; timestamp: string; body: string }[]
  >([]);
  const [metalXrayResponseComplete, setMetalXrayResponseComplete] = useState(false);
  const [comment, setComment] = useState("");
  const [outcome, setOutcome] = useState<"approved" | "rejected">("approved");
  const [sampleNewComment, setSampleNewComment] = useState("");
  const [sampleExtraComments, setSampleExtraComments] = useState<
    { id: string; authorName: string; timestamp: string; body: string }[]
  >([]);
  const [sampleResponseComplete, setSampleResponseComplete] = useState(false);
  const [sampleShowCompleteDialog, setSampleShowCompleteDialog] = useState(false);
  const [repairStatuses, setRepairStatuses] = useState<Record<string, RepairStatus>>(() => {
    const initial: Record<string, RepairStatus> = {};
    for (const [key, record] of Object.entries(glassPlasticRecords)) {
      if (record.status === "ng") initial[key] = "action_needed";
    }
    return initial;
  });
  const [scaleRepairStatuses, setScaleRepairStatuses] = useState<Record<string, ScaleRepairStatus>>(
    () => {
      const initial: Record<string, ScaleRepairStatus> = {};
      for (const scale of pendingReviewScales) {
        if (scale.record?.actionCheck === "ng") initial[scale.id] = "action_needed";
      }
      return initial;
    }
  );

  if (!review) {
    return (
      <>
        <AppHeader title="確認待ち" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            対象の確認待ち情報が見つかりません。
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/pending-review")}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            確認待ちに戻る
          </button>
        </div>
      </>
    );
  }

  const line = review.lineId
    ? (isCleaningLedger ? cleaningLines : lines).find((l) => l.id === review.lineId)
    : undefined;
  const waterRecord =
    review.pointId && review.recordId
      ? recordsByPoint[review.pointId]?.find((r) => r.id === review.recordId)
      : undefined;
  const floor = review.floorId ? glassPlasticFloors.find((f) => f.id === review.floorId) : undefined;
  const additive = review.additiveId
    ? additives.find((a) => a.id === review.additiveId)
    : undefined;
  const sampleDetail = review.sampleId ? SAMPLE_REVIEW_DETAILS[review.sampleId] : undefined;
  const machine = review.machineId ? MACHINES.find((m) => m.id === review.machineId) : undefined;

  const isEquipment = review.ledgerSlug === "equipment-inspection" && !!line;
  const isCleaning = isCleaningLedger && !!line;
  const isWater = review.ledgerSlug === "water-inspection" && !!waterRecord;
  const isGlassPlastic = isGlassPlasticLedger && !!floor;
  const isAdditive = isAdditiveLedger && !!additive;
  const isScaleInspection = isScaleInspectionLedger && !!review.postId;
  const isSample =
    review.ledgerSlug === "sample-management" && !!sampleDetail;
  const isSensory = isSensoryLedger;
  const isMetalXray = isMetalXrayLedger && !!machine;

  if (
    !isEquipment &&
    !isWater &&
    !isCleaning &&
    !isGlassPlastic &&
    !isAdditive &&
    !isScaleInspection &&
    !isSample &&
    !isSensory &&
    !isMetalXray &&
    review?.ledgerSlug !== "sample-management"
  ) {
    return (
      <>
        <AppHeader title="確認待ち" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            この帳票の確認機能は未対応です。
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/pending-review")}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            確認待ちに戻る
          </button>
        </div>
      </>
    );
  }

  const lineLabel = line ? `【${FREQUENCY_LABELS[line.frequency]}】${line.name}` : "";
  const confirmer = CONFIRMERS.find((c) => c.id === confirmerId) ?? CONFIRMERS[0];
  const confirmedReview = review;

  function handleApprove() {
    setOutcome("approved");
    setStep("complete");
  }

  function handleReject() {
    if (!comment.trim()) return;
    confirmedReview.status = "差し戻し";
    setOutcome("rejected");
    setStep("complete");
  }

  if (isSample && sampleDetail) {
    const allSampleComments = [...sampleDetail.comments, ...sampleExtraComments];
    const canCompleteSampleResponse = sampleExtraComments.length > 0;

    function handleSendSampleComment() {
      if (!sampleNewComment.trim()) return;
      setSampleExtraComments((prev) => [
        ...prev,
        {
          id: `local-${prev.length}`,
          authorName: sampleDetail!.inspectorName,
          timestamp: sampleDetail!.timestamp,
          body: sampleNewComment.trim(),
        },
      ]);
      setSampleNewComment("");
    }

    if (sampleResponseComplete) {
      return (
        <>
          <AppHeader title="検体管理" />
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
            <CompleteCheckmark />
            <p className="text-2xl text-[var(--semantic-brand-primary)]">対応が完了しました</p>
            <p className="text-base text-[var(--semantic-text-primary)]">ご確認ありがとうございます。</p>
            <button
              type="button"
              onClick={() => navigate("/app/pending-review")}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              確認待ちに戻る
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <AppHeader title="検体管理" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 pb-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex-1 flex flex-col gap-2 items-start min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-base text-[var(--semantic-text-secondary)]">製品名</span>
                <span className="text-base text-[var(--semantic-text-primary)]">
                  {sampleDetail.productName}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-base text-[var(--semantic-text-secondary)]">賞味期限</span>
                <span className="text-base text-[var(--semantic-text-primary)]">
                  {sampleDetail.expiryDate.replaceAll("-", "/")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {sampleDetail.inspectorName}
              </p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            {(
              [
                ["実施日", sampleDetail.inspectionDate.replaceAll("-", "/")],
                ["製造日", sampleDetail.manufactureDate.replaceAll("-", "/")],
                ["検体種別", SAMPLE_TYPE_LABELS[sampleDetail.sampleType]],
                ["検体数量", sampleDetail.quantity],
                ["単位", sampleDetail.unit],
                ["保管場所", sampleDetail.storageLocation],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
                </div>
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">
                  {sampleDetail.inspectorName} {sampleDetail.timestamp}
                </p>
                <div className="border-t border-[#d0d0d0] w-full" />
              </div>
            ))}
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-secondary)]">
                {sampleDetail.remarks || "特記事項はありません"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40 mt-8">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            </div>

            <div className="flex flex-col gap-3 items-start w-full">
              {allSampleComments.map((c) => (
                <div key={c.id} className="bg-white rounded-lg p-4 flex flex-col gap-2 items-start w-full">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-base text-[var(--semantic-brand-primary)] font-semibold">
                      {c.authorName}
                    </span>
                    <span className="text-xs text-[var(--semantic-text-secondary)]">{c.timestamp}</span>
                  </div>
                  <p className="text-base text-[var(--semantic-text-primary)]">{c.body}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 items-end w-full">
              <div className="flex gap-2 items-center w-full">
                <textarea
                  value={sampleNewComment}
                  onChange={(e) => setSampleNewComment(e.target.value.slice(0, 255))}
                  placeholder="コメントを入力"
                  rows={1}
                  className="flex-1 bg-white border border-[#d0d0d0] px-4 py-3 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] resize-none h-12 flex items-center"
                />
                <button
                  type="button"
                  onClick={handleSendSampleComment}
                  disabled={!sampleNewComment.trim()}
                  className={`size-12 rounded-lg flex items-center justify-center text-white text-lg shrink-0 ${
                    sampleNewComment.trim() ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
                  }`}
                >
                  ➤
                </button>
              </div>
              <span className="text-xs text-[var(--semantic-text-secondary)]">
                {sampleNewComment.length}/255
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/app/pending-review")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={() => setSampleShowCompleteDialog(true)}
            className="flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white bg-[var(--semantic-brand-primary)]"
          >
            提出
          </button>
        </div>

        {/* Complete Dialog */}
        {sampleShowCompleteDialog && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" />
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-[#f1efea] rounded-lg shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
                <div className="flex flex-col gap-6 items-center w-full">
                  <div className="flex flex-col gap-4 items-center w-full">
                    <svg className="size-20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M66.6667 40.0003C66.6667 25.2727 54.7276 13.3337 40 13.3337C25.2724 13.3337 13.3334 25.2727 13.3334 40.0003C13.3334 54.7279 25.2724 66.667 40 66.667C54.7276 66.667 66.6667 54.7279 66.6667 40.0003ZM73.3334 40.0003C73.3334 58.4098 58.4095 73.3337 40 73.3337C21.5905 73.3337 6.66669 58.4098 6.66669 40.0003C6.66669 21.5908 21.5905 6.66699 40 6.66699C58.4095 6.66699 73.3334 21.5908 73.3334 40.0003Z" fill="var(--semantic-brand-primary)"/>
                      <path d="M52.4935 30.527C53.7952 29.2255 55.9053 29.2253 57.207 30.527C58.5084 31.8286 58.5084 33.9388 57.207 35.2405L38.3886 54.0589L38.1445 54.2802C37.5516 54.7655 36.8049 55.0322 36.0319 55.0322C35.2587 55.0319 34.5121 54.766 33.9192 54.2802L33.6751 54.0589L24.4596 44.8401C23.1581 43.5383 23.1579 41.4283 24.4596 40.1266C25.7613 38.8251 27.8715 38.8251 29.1732 40.1266L36.0319 46.9853L52.4935 30.527Z" fill="var(--semantic-brand-primary)"/>
                    </svg>
                    <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center font-semibold">
                      提出が完了しました
                    </h2>
                  </div>
                  <p className="text-base text-[var(--semantic-text-primary)] text-center">
                    ご確認ありがとうございます。
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/app/pending-review")}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-16 px-4 rounded-lg text-xl text-[var(--semantic-brand-primary)] font-semibold w-60"
                >
                  確認待ちに戻る
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  if (step === "confirmer") {
    return (
      <>
        <AppHeader title="確認待ち" />
        <div className="flex-1 flex items-center justify-center">
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => navigate("/app/pending-review")} />
            <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
              <h2 className="text-2xl text-[var(--semantic-text-primary)]">確認者を選んでください</h2>
              <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
                {CONFIRMERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConfirmerId(c.id)}
                    className={`h-[78px] rounded-lg flex flex-col items-center justify-start pt-2 gap-0 p-4 shadow-[0px_2px_3px_rgba(51,51,51,0.24)] ${
                      confirmerId === c.id
                        ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                        : "bg-white border-2 border-transparent"
                    }`}
                  >
                    <span className="text-base text-[var(--semantic-text-primary)]">{c.name}</span>
                    <span className="text-sm text-[var(--semantic-text-secondary)]">{c.id}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-10 items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => navigate("/app/pending-review")}
                  className="bg-white border-2 border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-lg text-[var(--semantic-text-primary)] font-semibold"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextStep = review?.ledgerSlug === "sample-management" ? "confirmation" : "detail";
                    setStep(nextStep);
                  }}
                  className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-lg text-white font-semibold"
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (step === "confirmation" && review?.ledgerSlug === "sample-management" && sampleDetail) {
    return (
      <>
        <AppHeader title="検体管理" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex-1 flex flex-col gap-2 items-start min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-base text-[var(--semantic-text-secondary)]">製品名</span>
                <span className="text-base text-[var(--semantic-text-primary)]">{sampleDetail.productName}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-base text-[var(--semantic-text-secondary)]">賞味期限</span>
                <span className="text-base text-[var(--semantic-text-primary)]">{sampleDetail.expiryDate.replaceAll("-", "/")}</span>
              </div>
            </div>
          </div>

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{sampleDetail.inspectorName}</p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            {(
              [
                ["実施日", sampleDetail.inspectionDate.replaceAll("-", "/")],
                ["製造日", sampleDetail.manufactureDate.replaceAll("-", "/")],
                ["検体種別", SAMPLE_TYPE_LABELS[sampleDetail.sampleType]],
                ["検体数量", sampleDetail.quantity],
                ["単位", sampleDetail.unit],
                ["保管場所", sampleDetail.storageLocation],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
                </div>
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">
                  {sampleDetail.inspectorName} {sampleDetail.timestamp}
                </p>
                <div className="border-t border-[#d0d0d0] w-full" />
              </div>
            ))}
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-secondary)]">
                {sampleDetail.remarks || "特記事項はありません"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40">
            <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            <div className="flex gap-2 items-start w-full">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, commentMaxLength))}
                placeholder="コメントを入力"
                rows={3}
                className="flex-1 bg-white border border-[#d0d0d0] px-4 py-3 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] resize-none"
              />
            </div>
            <span className="text-xs text-[var(--semantic-text-secondary)]">
              {comment.length}/{commentMaxLength}
            </span>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={() => {
              setOutcome("approved");
              setStep("complete");
            }}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            提出
          </button>
        </div>
      </>
    );
  }

  if (isGlassPlastic && floor) {
    const floorName = floor.name;
    const inspector = glassPlasticRecords["出入口|時計1"]?.inspector ?? "高橋和子";

    if (step === "complete") {
      return (
        <>
          <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
            <CompleteCheckmark />
            <p className="text-2xl text-[var(--semantic-brand-primary)]">確認が完了しました</p>
            <p className="text-base text-[var(--semantic-text-primary)]">ご確認ありがとうございます。</p>
            <button
              type="button"
              onClick={() => navigate("/app/progress")}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              進捗一覧に戻る
            </button>
          </div>
        </>
      );
    }

    if (step === "repair") {
      const abnormalByRoom = glassPlasticRooms
        .map((room) => ({
          room,
          items: room.items.filter(
            (item) => glassPlasticRecords[keyFor(room.name, item.name)]?.status === "ng"
          ),
        }))
        .filter((group) => group.items.length > 0);

      return (
        <>
          <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <GlassPlasticMap floorName={floorName} />
            <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40">
              <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                異常があった箇所は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「修理完了」ステータスに変更してください。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
              {abnormalByRoom.map(({ room, items }) => (
                <div key={room.id} className="flex flex-col gap-4 items-start w-full">
                  <p className="text-xl text-[var(--semantic-brand-primary)]">{room.name}</p>
                  {items.map((item) => {
                    const key = keyFor(room.name, item.name);
                    const record = glassPlasticRecords[key];
                    const repairStatus = repairStatuses[key] ?? "action_needed";
                    return (
                      <div key={item.name} className="flex flex-col gap-1 items-start w-full">
                        <div className="flex items-center justify-between w-full gap-4">
                          <p className="text-lg text-[var(--semantic-text-primary)]">{item.name}</p>
                          <RepairStatusDropdown
                            value={repairStatus}
                            onChange={(value) =>
                              setRepairStatuses((prev) => ({ ...prev, [key]: value }))
                            }
                          />
                        </div>
                        <p className="text-base text-[var(--semantic-text-secondary)]">
                          内容：{record?.content}
                        </p>
                        <p className="text-base text-[var(--semantic-text-secondary)]">
                          原因：{record?.cause}
                        </p>
                        <p className="text-base text-[var(--semantic-text-secondary)]">
                          対応：{record?.actionType}
                          {record?.actionDetail && (
                            <>
                              <br />
                              {record.actionDetail}
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={() => {
                setOutcome("approved");
                setStep("complete");
              }}
              className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
            >
              確認
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <GlassPlasticMap floorName={floorName} />
          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{inspector}</p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">点検場所</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{floorName}</p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">2025/03/24</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 flex flex-col gap-10 items-start w-full max-w-full max-w-[480px] mx-40">
            {glassPlasticRooms.map((room) => (
              <div key={room.id} className="flex flex-col gap-4 items-start w-full">
                <p className="text-xl text-[var(--semantic-brand-primary)]">{room.name}</p>
                <div className="flex flex-col gap-5 items-start w-full">
                  {room.items.map((item) => {
                    const record = glassPlasticRecords[keyFor(room.name, item.name)];
                    const abnormal = record?.status === "ng";
                    return (
                      <div key={item.name} className="flex flex-col gap-2 items-start w-full">
                        <div className="flex items-center justify-between w-full gap-4">
                          <p className="text-lg text-[var(--semantic-text-primary)]">{item.name}</p>
                          <span
                            className={`h-8 w-24 rounded-lg flex items-center justify-center text-sm text-white shrink-0 ${
                              abnormal ? "bg-[#f85c5c]" : "bg-[#19c95f]"
                            }`}
                          >
                            {abnormal ? "異常あり" : "正常"}
                          </span>
                        </div>
                        {abnormal && (
                          <div className="flex flex-col gap-1 items-start px-2 w-full">
                            <p className="text-base text-[var(--semantic-text-secondary)]">
                              内容：{record?.content}
                            </p>
                            <p className="text-base text-[var(--semantic-text-secondary)]">
                              原因：{record?.cause}
                            </p>
                            <p className="text-base text-[var(--semantic-text-secondary)]">
                              対応：{record?.actionType}
                              {record?.actionDetail && (
                                <>
                                  <br />
                                  {record.actionDetail}
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={() => setStep("repair")}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            次へ
          </button>
        </div>
      </>
    );
  }

  if (isWater && waterRecord) {
    const handleWaterConfirm = () => {
      setOutcome("approved");
      setStep("complete");
    };

    return (
      <>
        <AppHeader title={`使用水の点検_${waterRecord.location}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <WaterConfirmRow label="実施者" value={waterRecord.inspector} />
            <WaterConfirmRow label="点検場所" value={waterRecord.location} />
            <WaterConfirmRow label="実施日" value={waterRecord.date} />
            {waterRecord.checks.map((item) => (
              <WaterCheckRow key={item.label} item={item} />
            ))}
            <WaterConfirmRow label="ph値" value={waterRecord.phValue} />
            <div className="flex flex-col w-full">
              <WaterConfirmRow label="残留塩素濃度(mg/ℓ)" value={waterRecord.residualChlorine} />
              <WaterToggleRow label="塩素補充" checked={waterRecord.chlorineToggle.checked} />
            </div>
            <div className="flex flex-col w-full">
              <WaterConfirmRow label="UV殺菌灯稼働時間(h)" value={waterRecord.uvOperatingHours} />
              <WaterToggleRow label="UV殺菌灯交換" checked={waterRecord.uvToggle.checked} />
            </div>
            <WaterConfirmRow label="UV表示灯" value={waterRecord.uvIndicatorLight} />
            <WaterConfirmRow label="異常検出灯" value={waterRecord.errorIndicatorLight} />
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleWaterConfirm}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            確認
          </button>
        </div>

        {step === "complete" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-16 w-full max-w-full max-w-[480px] mx-40 mx-16 min-h-[620px]">
              <div className="flex flex-col gap-6 items-center w-full">
                <div className="flex flex-col gap-4 items-center w-full">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[var(--semantic-brand-primary)]">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
                    <path
                      d="M24 41L34 51L56 29"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full">
                    確認が完了しました
                  </h2>
                </div>
                <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
                  ご確認ありがとうございます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/app/progress")}
                className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-brand-primary)]"
              >
                進捗一覧に戻る
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (isAdditive && additive) {
    const additiveRecords = initialAdditiveRecords.filter(
      (record) => record.additiveId === additive.id
    );
    const selectedAdditiveRecord = additiveRecords.find(
      (record) => record.id === selectedAdditiveRecordId
    );

    if (step === "complete") {
      return (
        <>
          <AppHeader title={`添加物管理_${additive.name}`} />
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
            <CompleteCheckmark />
            <p className="text-2xl text-[var(--semantic-brand-primary)]">
              {outcome === "rejected" ? "差し戻しが完了しました" : "提出が完了しました"}
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {outcome === "rejected"
                ? "実施者に差し戻し内容が通知されます。"
                : "ご確認ありがとうございます。"}
            </p>
            <button
              type="button"
              onClick={() => navigate("/app/pending-review")}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              確認待ちに戻る
            </button>
          </div>
        </>
      );
    }

    if (step === "record" && selectedAdditiveRecord) {
      return (
        <>
          <AppHeader title={`添加物管理_${additive.name}`} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedAdditiveRecord.date}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">保管場所</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedAdditiveRecord.storageLocation}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">規格</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{additive.spec}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">元在庫数</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {additive.initialStock}
                </p>
              </div>
            </div>

            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">区分</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedAdditiveRecord.category}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">数量</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedAdditiveRecord.quantity}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">現在庫数</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedAdditiveRecord.currentStock}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                <p className="text-base text-[var(--semantic-text-secondary)]">
                  {selectedAdditiveRecord.remarks}
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center w-full max-w-full max-w-[480px] mx-40">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, commentMaxLength))}
                placeholder="コメントを入力"
                className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <span className="text-xs text-[var(--semantic-text-secondary)] shrink-0">
                {comment.length}/{commentMaxLength}
              </span>
            </div>
          </div>

          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <AppHeader title={`添加物管理_${additive.name}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="flex items-center justify-between w-full max-w-full max-w-[480px] mx-40">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">2025/04/01</p>
          </div>

          <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full max-w-[480px] mx-40">
            <table className="border-collapse w-full">
              <thead>
                <tr className="bg-[var(--semantic-brand-primary)]">
                  {ADDITIVE_RECORD_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.width }}
                      className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {additiveRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAdditiveRecordId(record.id);
                          setStep("record");
                        }}
                        className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-sm text-white"
                      >
                        詳細
                      </button>
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.storageLocation}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.category}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.quantity}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.currentStock}
                    </td>
                    <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">
                      {record.remarks}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                      {record.actor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 items-center w-full max-w-full max-w-[480px] mx-40">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, commentMaxLength))}
              placeholder="コメントを入力"
              className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
            />
            <span className="text-xs text-[var(--semantic-text-secondary)] shrink-0">
              {comment.length}/{commentMaxLength}
            </span>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-40 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            disabled={!comment.trim()}
            onClick={handleReject}
            title={!comment.trim() ? "差し戻す理由をコメントに入力してください" : undefined}
            className={`h-16 w-40 rounded-lg text-xl border ${
              comment.trim()
                ? "bg-white border-[var(--semantic-brand-danger)] text-[var(--semantic-brand-danger)]"
                : "bg-[#d0d0d0] border-[#d0d0d0] text-white"
            }`}
          >
            差し戻し
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-40 rounded-lg text-xl text-white"
          >
            提出
          </button>
        </div>
      </>
    );
  }

  if (isScaleInspection) {
    const postName = review.name;
    const scales = pendingReviewScales;
    const ngScales = scales.filter((s) => s.record?.actionCheck === "ng");
    const selectedScale = scales.find((s) => s.id === selectedScaleId);

    function handleScaleNext() {
      if (ngScales.length > 0) {
        setStep("repair");
      } else {
        setOutcome("approved");
        setStep("complete");
      }
    }

    function handleScaleSubmit() {
      setOutcome("approved");
      setStep("complete");
    }

    if (step === "complete") {
      return (
        <>
          <AppHeader title="秤点検記録" />
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
            <CompleteCheckmark />
            <p className="text-2xl text-[var(--semantic-brand-primary)]">確認が完了しました</p>
            <p className="text-base text-[var(--semantic-text-primary)]">ご確認ありがとうございます。</p>
            <button
              type="button"
              onClick={() => navigate("/app/pending-review")}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              確認待ちに戻る
            </button>
          </div>
        </>
      );
    }

    if (step === "scaleDetail" && selectedScale) {
      return (
        <>
          <AppHeader title="秤点検記録" />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {scalePendingReviewPost.date.replaceAll("-", "/")}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {scalePendingReviewPost.inspectorName}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">持ち場</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{postName}</p>
              </div>
            </div>

            <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{selectedScale.label}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">シリアルナンバー</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedScale.serialNumber}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              {selectedScale.record?.actionCheck === "ng" ? (
                <>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">動作確認</p>
                    <ScaleStatusTag label="異常あり" color="#f85c5c" />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">水平点検</p>
                    <ScaleDash />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">汚れ</p>
                    <ScaleDash />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-base text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                      <p className="text-sm text-[#808080]">
                        使用分銅(g)：{selectedScale.referenceWeight}
                      </p>
                    </div>
                    <ScaleDash />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                    <p className="text-base text-[var(--semantic-text-primary)]">
                      {selectedScale.record?.remarks}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">動作確認</p>
                    <ScaleStatusTag label="正常" color="#19c95f" />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">水平点検</p>
                    <ScaleStatusTag label="正常" color="#19c95f" />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">汚れ</p>
                    <ScaleStatusTag label="正常" color="#19c95f" />
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-base text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                      <p className="text-sm text-[#808080]">
                        使用分銅(g)：{selectedScale.referenceWeight}
                      </p>
                    </div>
                    <p className="text-base text-[var(--semantic-text-primary)]">
                      {selectedScale.record?.displayValue}
                    </p>
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                    <p className="text-base text-[var(--semantic-text-primary)]">
                      {selectedScale.record?.remarks}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40">
              <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
              <div className="flex gap-2 items-center w-full">
                <input
                  type="text"
                  value={scaleComment}
                  onChange={(e) => setScaleComment(e.target.value.slice(0, commentMaxLength))}
                  placeholder="コメントを入力"
                  className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <button
                  type="button"
                  onClick={() => setScaleComment("")}
                  className="bg-[var(--semantic-brand-primary)] size-12 rounded-lg flex items-center justify-center text-white shrink-0"
                  aria-label="コメントを送信"
                >
                  ➤
                </button>
              </div>
              <span className="text-xs text-[var(--semantic-text-secondary)] self-end">
                {scaleComment.length}/{commentMaxLength}
              </span>
            </div>
          </div>

          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
          </div>
        </>
      );
    }

    if (step === "repair") {
      return (
        <>
          <AppHeader title="秤点検記録" />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40">
              <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                異常があった秤は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「対応完了」ステータスに変更してください。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col gap-6 items-start w-full max-w-full max-w-[480px] mx-40">
              {ngScales.map((scale) => (
                <div key={scale.id} className="flex flex-col gap-1 items-start w-full">
                  <div className="flex items-center justify-between w-full gap-4">
                    <p className="text-lg text-[var(--semantic-text-primary)]">{scale.serialNumber}</p>
                    <ScaleRepairStatusDropdown
                      value={scaleRepairStatuses[scale.id] ?? "action_needed"}
                      onChange={(value) =>
                        setScaleRepairStatuses((prev) => ({ ...prev, [scale.id]: value }))
                      }
                    />
                  </div>
                  <p className="text-base text-[var(--semantic-text-secondary)]">
                    原因：{scale.record?.cause}
                  </p>
                  <p className="text-base text-[var(--semantic-text-secondary)]">
                    対応：{scale.record?.actionType}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleScaleSubmit}
              className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
            >
              提出
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <AppHeader title="秤点検記録" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {scalePendingReviewPost.date.replaceAll("-", "/")}
              </p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {scalePendingReviewPost.inspectorName}
              </p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">持ち場</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{postName}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full max-w-[480px] mx-40">
            <table className="border-collapse w-full">
              <thead>
                <tr className="bg-[var(--semantic-brand-primary)]">
                  {SCALE_TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.width }}
                      className="text-white text-sm font-semibold px-2 py-2 whitespace-pre-line"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scales.map((scale, index) => (
                  <tr key={scale.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScaleId(scale.id);
                          setStep("scaleDetail");
                        }}
                        className="bg-[var(--semantic-brand-primary)] h-8 w-14 rounded-lg text-xs text-white"
                      >
                        詳細
                      </button>
                    </td>
                    <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">{scale.label}</td>
                    <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                      {scale.serialNumber}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <ScaleActionCheckBadge value={scale.record?.actionCheck ?? null} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      {scale.record?.actionCheck === "ng" ? (
                        <ScaleDash />
                      ) : (
                        <ScaleCheckBadge checked={scale.record?.levelCheck ?? false} />
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {scale.record?.actionCheck === "ng" ? (
                        <ScaleDash />
                      ) : (
                        <ScaleCheckBadge checked={scale.record?.dirtCheck ?? false} />
                      )}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {scale.record?.actionCheck === "ng" ? <ScaleDash /> : scale.record?.displayValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleScaleNext}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            次へ
          </button>
        </div>
      </>
    );
  }

  if (isSensory) {
    const rows = pendingReviewScoreRows;
    const overallResult = sensoryOverallResult(rows);
    const selectedRow = rows.find((r) => r.id === selectedScoreRowId);

    function handleSensorySubmit() {
      if (overallResult === "fail") {
        confirmedReview.status = "差し戻し";
        setOutcome("rejected");
      } else {
        setOutcome("approved");
      }
      setStep("complete");
    }

    if (step === "complete") {
      return (
        <>
          <AppHeader title="官能検査記録" />
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
            <CompleteCheckmark />
            <p className="text-2xl text-[var(--semantic-brand-primary)]">
              {outcome === "rejected" ? "差し戻しが完了しました" : "確認が完了しました"}
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {outcome === "rejected"
                ? "実施者に差し戻し内容が通知されます。"
                : "ご確認ありがとうございます。"}
            </p>
            <button
              type="button"
              onClick={() => navigate("/app/pending-review")}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              確認待ちに戻る
            </button>
          </div>
        </>
      );
    }

    if (step === "scoreDetail" && selectedRow) {
      return (
        <>
          <AppHeader title="官能検査記録" />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="bg-white flex flex-wrap gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex gap-2 items-center">
                <span className="text-base text-[#808080] w-[90px]">検査商品名</span>
                <span className="text-base text-[var(--semantic-text-primary)]">
                  {pendingReviewProduct.name}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-base text-[#808080] w-[90px]">賞味期限</span>
                <span className="text-base text-[var(--semantic-text-primary)]">
                  {pendingReviewProduct.expiryDate.replaceAll("-", "/")}
                </span>
              </div>
            </div>

            <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedRow.inspectorName}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedRow.date.replaceAll("-", "/")}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">製造日</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedRow.manufactureDate.replaceAll("-", "/")}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">比較商品</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {selectedRow.comparison === "present" ? "比較商品あり" : "比較商品なし"}
                </p>
              </div>
              {selectedRow.comparison === "present" && (
                <>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">比較商品製造日</p>
                    <p className="text-base text-[var(--semantic-text-primary)]">
                      {selectedRow.comparisonManufactureDate.replaceAll("-", "/")}
                    </p>
                  </div>
                </>
              )}
              {CRITERIA.map((criterion) => {
                const score = selectedRow.scores[criterion];
                return (
                  <div key={criterion} className="flex flex-col gap-1 w-full">
                    <div className="border-t border-[#d0d0d0] w-full" />
                    <div className="flex items-center justify-between w-full">
                      <p className="text-base text-[var(--semantic-text-primary)]">{criterion}</p>
                      <ScaleStatusTag
                        label={String(score.score)}
                        color={score.score <= 2 ? "#f85c5c" : "#19c95f"}
                      />
                    </div>
                    {score.score <= 2 && (
                      <p className="text-base text-[#808080] px-2">理由：{score.reason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <AppHeader title="官能検査記録" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
            <p className="text-sm text-[var(--semantic-text-primary)]">
              実施予定者に足りていない時はコメント欄に記載してください。
            </p>
          </div>

          <div className="bg-white flex flex-wrap gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex gap-2 items-center">
              <span className="text-base text-[#808080] w-[90px]">検査商品名</span>
              <span className="text-base text-[var(--semantic-text-primary)]">
                {pendingReviewProduct.name}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-base text-[#808080] w-[90px]">賞味期限</span>
              <span className="text-base text-[var(--semantic-text-primary)]">
                {pendingReviewProduct.expiryDate.replaceAll("-", "/")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-end w-full max-w-full max-w-[480px] mx-40">
            <div className="bg-white rounded-lg overflow-x-auto w-full">
              <table className="border-collapse w-full">
                <thead>
                  <tr className="bg-[var(--semantic-brand-primary)]">
                    {SENSORY_TABLE_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        style={{ minWidth: col.width }}
                        className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedScoreRowId(row.id);
                            setStep("scoreDetail");
                          }}
                          className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-xs text-white"
                        >
                          詳細
                        </button>
                      </td>
                      <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] text-center whitespace-nowrap">
                        {row.inspectorName}
                      </td>
                      {CRITERIA.map((criterion) => (
                        <td
                          key={criterion}
                          className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]"
                        >
                          {row.scores[criterion].score}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-white border-t border-[#808080]">
                    <td colSpan={2} className="px-2 py-2 text-center text-base text-[var(--semantic-brand-primary)]">
                      平均
                    </td>
                    {CRITERIA.map((criterion) => (
                      <td
                        key={criterion}
                        className="px-2 py-2 text-center text-base text-[var(--semantic-brand-primary)]"
                      >
                        {sensoryAverage(rows, criterion)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex h-12 w-60 rounded-lg overflow-hidden shrink-0">
              <div className="flex-1 bg-white flex items-center justify-center text-base text-[var(--semantic-text-primary)]">
                検査結果
              </div>
              <div
                className="flex-1 flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: overallResult === "pass" ? "#19c95f" : "#f85c5c" }}
              >
                {overallResult === "pass" ? <img src={iconCheck} alt="合格" className="size-6" /> : <img src={iconXMark} alt="不合格" className="size-6" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40">
            <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            <div className="flex gap-2 items-center w-full">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, commentMaxLength))}
                placeholder="コメントを入力"
                className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <button
                type="button"
                onClick={() => setComment("")}
                className="bg-[var(--semantic-brand-primary)] size-12 rounded-lg flex items-center justify-center text-white shrink-0"
                aria-label="コメントを送信"
              >
                ➤
              </button>
            </div>
            <span className="text-xs text-[var(--semantic-text-secondary)] self-end">
              {comment.length}/{commentMaxLength}
            </span>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleSensorySubmit}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            提出
          </button>
        </div>
      </>
    );
  }

  if (isMetalXray && machine) {
    const machineRecords = MACHINE_RECORDS[machine.id] ?? [];
    const inspectionDate = MACHINE_INSPECTION_DATES[machine.id] ?? "";
    const selectedMachineRecord = machineRecords.find((r) => r.id === selectedMachineRecordId);

    function handleMetalXraySubmit() {
      setOutcome("approved");
      setStep("complete");
    }

    if (step === "machineRecordDetail" && selectedMachineRecord) {
      const record = selectedMachineRecord;
      const recordTimestamp = `${record.inspectorName} ${
        inspectionDate ? inspectionDate.replaceAll("-", "/") : ""
      } ${record.time}`;

      return (
        <>
          <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {inspectionDate ? inspectionDate.replaceAll("-", "/") : ""}
              </p>
            </div>

            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{record.inspectorName}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">点検内容</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{record.content}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-1 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">点検時間</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{record.time}</p>
                </div>
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">
                  {recordTimestamp}
                </p>
              </div>

              {record.content === "動作確認" && record.detail ? (
                <>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <MetalXrayChecklistGroup
                    label="金属探知機"
                    unit={record.detail.metalUnit}
                    checklist={METAL_DETECTOR_CHECKLIST}
                    checks={record.detail.metalChecks}
                    timestamp={recordTimestamp}
                  />
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <MetalXrayChecklistGroup
                    label="X線探知機"
                    unit={record.detail.xrayUnit}
                    checklist={XRAY_DETECTOR_CHECKLIST}
                    checks={record.detail.xrayChecks}
                    timestamp={recordTimestamp}
                  />
                </>
              ) : (
                <>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">通過製品</p>
                    <p className="text-base text-[var(--semantic-text-primary)]">
                      {record.passedProduct || "ー"}
                    </p>
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base text-[var(--semantic-text-primary)]">結果</p>
                    <span
                      className="h-6 px-2 rounded-lg text-xs text-white inline-flex items-center justify-center"
                      style={{ backgroundColor: RESULT_COLORS[record.result] }}
                    >
                      {RESULT_LABELS[record.result]}
                    </span>
                  </div>
                </>
              )}

              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                <p className="text-base text-[var(--semantic-text-secondary)]">
                  {record.remarks || "特記事項はありません"}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
          </div>
        </>
      );
    }

    if (review.status === "差し戻し") {
      const rejectionComments = MACHINE_REJECTION_COMMENTS[machine.id] ?? [];
      const allMetalXrayComments = [...rejectionComments, ...metalXrayExtraComments];
      const canCompleteMetalXrayResponse = metalXrayExtraComments.length > 0;

      const handleSendMetalXrayComment = () => {
        if (!metalXrayNewComment.trim()) return;
        setMetalXrayExtraComments((prev) => [
          ...prev,
          {
            id: `local-${prev.length}`,
            authorName: confirmer.name,
            timestamp: "25.04.02 10:20",
            body: metalXrayNewComment.trim(),
          },
        ]);
        setMetalXrayNewComment("");
      };

      const openMetalXrayActorPicker = () => {
        setSelectedMetalXrayActorId(ACTORS[0].id);
        setMetalXrayActorPickerOpen(true);
      };

      const confirmMetalXrayActorPicker = () => {
        const actor = ACTORS.find((a) => a.id === selectedMetalXrayActorId) ?? ACTORS[0];
        setMetalXrayActorPickerOpen(false);
        navigate(`/app/ledger-list/metal-xray-detection/machines/${machine.id}`, {
          state: { inspectorName: actor.name },
        });
      };

      return (
        <>
          <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {inspectionDate ? inspectionDate.replaceAll("-", "/") : "2025/03/24"}
              </p>
            </div>

            <div className="bg-white rounded-lg overflow-x-auto w-full">
              <table className="border-collapse w-full">
                <thead>
                  <tr className="bg-[#094]">
                    {METAL_XRAY_REVIEW_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        style={{ minWidth: col.width }}
                        className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {machineRecords.map((record, index) => (
                    <tr key={record.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMachineRecordId(record.id);
                            setStep("machineRecordDetail");
                          }}
                          className="bg-[#094] h-8 px-3 rounded-lg text-sm text-white"
                        >
                          詳細
                        </button>
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {record.category}
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {record.time}
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {record.content}
                      </td>
                      <td
                        className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: 200 }}
                      >
                        {record.passedProduct}
                      </td>
                      <td className="px-2 py-2 text-center text-sm">
                        <span
                          className="h-6 px-2 rounded-lg text-xs text-white inline-flex items-center justify-center"
                          style={{ backgroundColor: RESULT_COLORS[record.result] }}
                        >
                          {RESULT_LABELS[record.result]}
                        </span>
                      </td>
                      <td
                        className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: 160 }}
                      >
                        {record.remarks}
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                        {record.inspectorName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 items-start w-full mt-12">
              <p className="text-lg font-semibold text-[var(--semantic-text-primary)]">コメント</p>

              <div className="flex flex-col gap-6 items-start w-full">
                <div className="bg-white flex flex-col gap-6 items-end px-4 py-6 rounded-lg w-full">
                  <div className="flex flex-col gap-4 items-start w-full">
                    {allMetalXrayComments.map((c) => (
                      <div key={c.id} className="flex flex-col gap-4 items-start w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#808080]">
                            {c.authorName}
                          </span>
                          <span className="text-sm text-[#808080]">{c.timestamp}</span>
                        </div>
                        <p className="text-base font-light text-[var(--semantic-text-primary)] leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-2 items-start w-full">
                    <textarea
                      value={metalXrayNewComment}
                      onChange={(e) => setMetalXrayNewComment(e.target.value.slice(0, 255))}
                      placeholder="コメントを入力"
                      rows={3}
                      className="flex-1 bg-white border border-[#d0d0d0] px-2 py-2 rounded-lg text-base font-light text-[var(--semantic-text-primary)] placeholder:text-[#808080] resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendMetalXrayComment}
                      disabled={!metalXrayNewComment.trim()}
                      className={`size-12 rounded-lg flex items-center justify-center text-white text-lg shrink-0 ${
                        metalXrayNewComment.trim() ? "bg-[#094]" : "bg-[#d0d0d0]"
                      }`}
                    >
                      ➤
                    </button>
                  </div>
                  <span className="text-sm text-[#333] text-right w-full">
                    {metalXrayNewComment.length}/255
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setStep("confirmer")}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={!canCompleteMetalXrayResponse}
              onClick={() => setMetalXrayResponseComplete(true)}
              className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                canCompleteMetalXrayResponse ? "bg-[var(--semantic-brand-primary)]" : "bg-[#808080] opacity-50"
              }`}
            >
              差し戻し対応完了
            </button>
          </div>

          {metalXrayActorPickerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMetalXrayActorPickerOpen(false)} />
              <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-16 w-full max-w-full max-w-[480px] mx-40 mx-16 min-h-[620px]">
                <h2 className="text-2xl text-[var(--semantic-text-primary)]">実施者を選んでください</h2>
                <div className="flex flex-wrap gap-4 items-start w-full">
                  {ACTORS.map((actor) => (
                    <button
                      key={actor.id}
                      type="button"
                      onClick={() => setSelectedMetalXrayActorId(actor.id)}
                      className={`flex-1 min-w-[160px] h-16 rounded-lg flex flex-col items-center justify-center gap-1 ${
                        selectedMetalXrayActorId === actor.id
                          ? "bg-white border border-[var(--semantic-brand-primary)]"
                          : "bg-white"
                      }`}
                    >
                      <span className="text-base text-[var(--semantic-text-primary)]">{actor.name}</span>
                      <span className="text-sm text-[var(--semantic-text-secondary)]">{actor.id}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-6 items-center justify-center w-full mt-auto">
                  <button
                    type="button"
                    onClick={() => setMetalXrayActorPickerOpen(false)}
                    className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-40 rounded-lg text-base text-[var(--semantic-text-primary)]"
                  >
                    閉じる
                  </button>
                  <button
                    type="button"
                    onClick={confirmMetalXrayActorPicker}
                    className="bg-[var(--semantic-brand-primary)] h-12 w-40 rounded-lg text-base text-white"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          )}

          {metalXrayResponseComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-16 w-full max-w-full max-w-[480px] mx-40 mx-16 min-h-[620px]">
                <div className="flex flex-col gap-6 items-center w-full">
                  <div className="flex flex-col gap-4 items-center w-full">
                    <CompleteCheckmark />
                    <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full">
                      差し戻し対応が完了しました
                    </h2>
                  </div>
                  <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
                    ご確認ありがとうございます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/app/pending-review")}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-brand-primary)]"
                >
                  確認待ちに戻る
                </button>
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {inspectionDate ? inspectionDate.replaceAll("-", "/") : ""}
            </p>
          </div>

          <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full max-w-[480px] mx-40">
            <table className="border-collapse w-full">
              <thead>
                <tr className="bg-[var(--semantic-brand-primary)]">
                  {METAL_XRAY_REVIEW_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.width }}
                      className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {machineRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMachineRecordId(record.id);
                          setStep("machineRecordDetail");
                        }}
                        className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-sm text-white"
                      >
                        詳細
                      </button>
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.category}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.time}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.content}
                    </td>
                    <td
                      className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ maxWidth: 200 }}
                    >
                      {record.passedProduct}
                    </td>
                    <td className="px-2 py-2 text-center text-sm">
                      <span
                        className="h-6 px-2 rounded-lg text-xs text-white inline-flex items-center justify-center"
                        style={{ backgroundColor: RESULT_COLORS[record.result] }}
                      >
                        {RESULT_LABELS[record.result]}
                      </span>
                    </td>
                    <td
                      className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ maxWidth: 160 }}
                    >
                      {record.remarks}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                      {record.inspectorName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full max-w-[480px] mx-40 mt-12">
            <p className="text-lg font-semibold text-[var(--semantic-text-primary)]">コメント</p>

            <div className="flex flex-col gap-6 items-start w-full">
              {(MACHINE_REJECTION_COMMENTS[machine.id]?.length > 0 || metalXrayExtraComments.length > 0) && (
                <div className="bg-white flex flex-col gap-6 items-end px-4 py-6 rounded-lg w-full">
                  <div className="flex flex-col gap-4 items-start w-full">
                    {[...(MACHINE_REJECTION_COMMENTS[machine.id] ?? []), ...metalXrayExtraComments].map((c) => (
                      <div key={c.id} className="flex flex-col gap-4 items-start w-full">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-lg font-semibold text-[#094]">
                            {c.authorName}
                          </span>
                          <span className="text-sm text-[#808080]">{c.timestamp}</span>
                        </div>
                        <p className="text-base font-light text-[var(--semantic-text-primary)] leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 items-start w-full">
                <div className="flex gap-2 items-stretch w-full">
                  <textarea
                    value={metalXrayComment}
                    onChange={(e) => setMetalXrayComment(e.target.value.slice(0, commentMaxLength))}
                    placeholder="コメントを入力"
                    className="flex-1 h-12 bg-white border border-[#d0d0d0] px-2 py-2 rounded-lg text-base font-light text-[var(--semantic-text-primary)] placeholder:text-[#808080] resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!metalXrayComment.trim()) return;
                      setMetalXrayExtraComments((prev) => [
                        ...prev,
                        {
                          id: `local-${prev.length}`,
                          authorName: confirmer.name,
                          timestamp: "25.04.02 10:20",
                          body: metalXrayComment.trim(),
                        },
                      ]);
                      setMetalXrayComment("");
                    }}
                    disabled={!metalXrayComment.trim()}
                    className={`size-12 rounded-lg flex items-center justify-center text-white text-lg shrink-0 ${
                      metalXrayComment.trim() ? "bg-[#094]" : "bg-[#d0d0d0]"
                    }`}
                  >
                    ➤
                  </button>
                </div>
                <span className="text-sm text-[#333] text-right w-full">
                  {metalXrayComment.length}/{commentMaxLength}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setStep("confirmer")}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleMetalXraySubmit}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            提出
          </button>
        </div>

        {step === "complete" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-16 w-full max-w-full max-w-[480px] mx-40 mx-16 min-h-[620px]">
              <div className="flex flex-col gap-6 items-center w-full">
                <div className="flex flex-col gap-4 items-center w-full">
                  <CompleteCheckmark />
                  <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full">
                    提出が完了しました
                  </h2>
                </div>
                <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
                  ご確認ありがとうございます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/app/pending-review")}
                className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-brand-primary)]"
              >
                確認待ちに戻る
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (step === "complete") {
    return (
      <>
        <AppHeader title={`${isCleaning ? "清掃記録" : "機械器具点検"}_${lineLabel}`} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[var(--semantic-brand-primary)]">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
            <path d="M24 41L34 51L56 29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-2xl text-[var(--semantic-brand-primary)]">
            {outcome === "rejected" ? "差し戻しが完了しました" : "提出が完了しました"}
          </p>
          <p className="text-base text-[var(--semantic-text-primary)]">
            {outcome === "rejected" ? "実施者に差し戻し内容が通知されます。" : "ご確認ありがとうございます。"}
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/pending-review")}
            className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-[var(--semantic-brand-primary)]"
          >
            確認待ちに戻る
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={`${isCleaning ? "清掃記録" : "機械器具点検"}_${lineLabel}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">2025/04/01</p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">
              {isCleaning ? "実施者" : "確認者"}
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {isCleaning
                ? pendingReviewRecords["つまみ上げパック機|シール部"]?.inspector
                : confirmer.name}
            </p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">持ち場/ライン</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{lineLabel}</p>
          </div>
        </div>

        {isCleaning
          ? cleaningPoints.map((point) => (
              <div
                key={point.id}
                className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40"
              >
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between px-2 py-2 rounded-lg w-full">
                  <p className="text-base text-white">清掃箇所</p>
                  <p className="text-base text-white">{point.location}</p>
                </div>
                <div className="flex flex-col gap-3 items-start px-2 w-full">
                  <p className="text-base text-[var(--semantic-brand-primary)]">清掃項目</p>
                  {point.items.map((item) => {
                    const record = pendingReviewRecords[keyFor(point.location, item)];
                    return (
                      <div key={item} className="flex flex-col gap-2 items-start w-full">
                        <div className="flex items-center justify-between w-full gap-4">
                          <p className="text-base text-[var(--semantic-text-primary)]">{item}</p>
                          <span className="bg-[#19c95f] flex h-6 w-16 items-center justify-center rounded-lg text-xs text-white">
                            清掃済
                          </span>
                        </div>
                        {record?.timestamp && (
                          <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">
                            {record.inspector} {record.timestamp}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          : (["start", "end"] as const).map((tab) => (
              <div
                key={tab}
                className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40"
              >
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">実施区分</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">{TAB_LABEL[tab]}</p>
                </div>
                <div className="border-t border-[#d0d0d0] w-full" />

                {inspectionPoints.map((point) => (
                  <div key={point.id} className="flex flex-col gap-3 items-start w-full">
                    <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between px-2 py-2 rounded-lg w-full">
                      <p className="text-base text-white">点検箇所</p>
                      <p className="text-base text-white">{point.location}</p>
                    </div>
                    <div className="flex flex-col gap-3 items-start px-2 w-full">
                      <p className="text-base text-[var(--semantic-brand-primary)]">点検項目</p>
                      {point.items.map((item) => {
                        const record = initialRecords[keyFor(point.location, item)];
                        return (
                          <div key={item} className="flex flex-col gap-2 items-start w-full">
                            <div className="flex items-center justify-between w-full gap-4">
                              <p className="text-base text-[var(--semantic-text-primary)]">{item}</p>
                              <StatusTag status={record?.status ?? null} />
                            </div>
                            {record?.status === "ng" && (
                              <div className="flex flex-col gap-1 items-start px-2 w-full">
                                <p className="text-base text-[var(--semantic-text-secondary)]">
                                  原因：{record.cause}
                                </p>
                                <p className="text-base text-[var(--semantic-text-secondary)]">
                                  対応：{record.actionType}
                                  {record.actionDetail && (
                                    <>
                                      <br />
                                      {record.actionDetail}
                                    </>
                                  )}
                                </p>
                              </div>
                            )}
                            {record?.timestamp && (
                              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">
                                {record.inspector} {record.timestamp}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-[#d0d0d0] w-full" />
                  </div>
                ))}

                <div className="flex flex-col gap-2 items-start px-2 w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                  <p className="text-base text-[var(--semantic-text-secondary)]">
                    {tab === "start"
                      ? initialRemarks
                      : "点検内容に関する補足を入力できます（任意）"}
                  </p>
                </div>
              </div>
            ))}

        {isCleaning && (
          <div className="bg-white flex flex-col gap-2 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-secondary)]">
              {cleaningInitialRemarks}
            </p>
          </div>
        )}

        <div className="flex gap-2 items-center w-full max-w-full max-w-[480px] mx-40">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, commentMaxLength))}
            placeholder="コメントを入力"
            className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
          />
          <span className="text-xs text-[var(--semantic-text-secondary)] shrink-0">
            {comment.length}/{commentMaxLength}
          </span>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setStep("confirmer")}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-40 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!comment.trim()}
          onClick={handleReject}
          title={!comment.trim() ? "差し戻す理由をコメントに入力してください" : undefined}
          className={`h-16 w-40 rounded-lg text-xl border ${
            comment.trim()
              ? "bg-white border-[var(--semantic-brand-danger)] text-[var(--semantic-brand-danger)]"
              : "bg-[#d0d0d0] border-[#d0d0d0] text-white"
          }`}
        >
          差し戻し
        </button>
        <button
          type="button"
          onClick={handleApprove}
          className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-40 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}
