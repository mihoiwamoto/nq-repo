import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconArrowDown from "../../../assets/figma/icons/common/arrow-down.svg";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import iconExpand from "../../../assets/figma/icons/common/expansion.svg";
import iconReduce from "../../../assets/figma/icons/common/reduction.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import { CommentInput } from "../../components/CommentInput";
import { CompleteDialog } from "../../components/CompleteDialog";
import { DrumRollPicker } from "../../components/DrumRollPicker";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { commentTimestamp } from "../../utils/date";
import { seedTimestamp } from "../../utils/recordTimestamps";
import { PENDING_REVIEWS } from "../../data/pendingReviews";
import {
  FREQUENCY_LABELS,
  inspectionPoints,
  initialRecords,
  initialRemarks,
  lines,
  LINE_REJECTION_COMMENTS,
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
  REPAIR_STATUS_NEXT_OPTIONS,
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
  type Scale,
  type ScaleRepairStatus,
} from "../scale-inspection/mockData";
import { SAMPLE_REVIEW_DETAILS, SAMPLE_TYPE_LABELS } from "../sample-management/mockData";
import { SampleProductInfo } from "../sample-management/SampleProductInfo";
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
                      className="h-6 w-16 shrink-0 rounded-lg text-xs text-white inline-flex items-center justify-center"
                      style={{ backgroundColor: RESULT_COLORS[checks[item.key] === "ok" ? "OK" : "NG"] }}
                    >
                      {RESULT_LABELS[checks[item.key] === "ok" ? "OK" : "NG"]}
                    </span>
                  </div>
                  {timestamp && (
                    <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
                  )}
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
  const options = REPAIR_STATUS_NEXT_OPTIONS[value];
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
  const options = SCALE_REPAIR_STATUS_NEXT_OPTIONS[value].map((status) => ({
    value: status,
    label: SCALE_REPAIR_STATUS_LABELS[status],
  }));
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
      <DrumRollPicker
        open={open}
        value={value}
        options={options}
        onConfirm={(status) => {
          onChange(status);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

function GlassPlasticMap({ floorName }: { floorName: string }) {
  const [mapScale, setMapScale] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);
  return (
    <div
      className={`relative bg-[#d0d0d0] border border-[var(--semantic-brand-primary)] rounded-lg overflow-auto w-full max-w-full ${
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
      <div className="absolute right-4 bottom-4 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
        <button
          type="button"
          onClick={() => setMapScale((s) => Math.min(s + 0.2, 2))}
          className="bg-white w-10 h-10 flex items-center justify-center text-xl border-b border-[#d0d0d0]"
        >
          <img src={iconPlus} alt="拡大" className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => setMapScale((s) => Math.max(s - 0.2, 0.6))}
          className="bg-white w-10 h-10 flex items-center justify-center text-xl"
        >
          <img src={iconMinus} alt="縮小" className="size-6" />
        </button>
      </div>
    </div>
  );
}

function ScaleDash() {
  return <span className="inline-block w-[10px] h-0.5 rounded-full bg-[#333] shrink-0" />;
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

/**
 * 秤 1 台分の記録カード。確認待ちの一覧画面（秤ごとに縦に積む）で使う。
 * 動作確認が「異常あり」のときは、そこで点検が止まるので以降の項目は「−」。
 */
function ScaleRecordCard({
  scale,
  inspectorName,
  recordDate,
}: {
  scale: Scale;
  inspectorName: string;
  recordDate: string;
}) {
  const record = scale.record;
  const isNg = record?.actionCheck === "ng";
  // 記録済みのデータなので、実施日から「誰がいつ入れたか」を組み立てて各項目に出す。
  // 入力の無い項目（異常ありで止まった秤の水平点検など）には出さない。
  const stamp = (recorded: unknown) => (recorded ? seedTimestamp(recordDate) : undefined);
  const inspector = record?.inspector ?? inspectorName;

  return (
    <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{scale.label}</p>
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">シリアルナンバー</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{scale.serialNumber}</p>
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between w-full">
          <p className="text-base text-[var(--semantic-text-primary)]">動作確認</p>
          {isNg ? (
            <ScaleStatusTag label="異常あり" color="#f85c5c" />
          ) : (
            <ScaleStatusTag label="正常" color="#19c95f" />
          )}
        </div>
        <RecordTimestamp inspector={inspector} timestamp={stamp(record?.actionCheck)} />
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between w-full">
          <p className="text-base text-[var(--semantic-text-primary)]">水平点検</p>
          {isNg ? <ScaleDash /> : <ScaleStatusTag label="正常" color="#19c95f" />}
        </div>
        {!isNg && (
          <RecordTimestamp inspector={inspector} timestamp={stamp(record?.levelCheck)} />
        )}
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between w-full">
          <p className="text-base text-[var(--semantic-text-primary)]">汚れ</p>
          {isNg ? <ScaleDash /> : <ScaleStatusTag label="正常" color="#19c95f" />}
        </div>
        {!isNg && <RecordTimestamp inspector={inspector} timestamp={stamp(record?.dirtCheck)} />}
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-2 items-start">
            <p className="text-base text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
            <p className="text-sm text-[#808080]">使用分銅(g)：{scale.referenceWeight}</p>
          </div>
          {isNg ? (
            <ScaleDash />
          ) : (
            <p className="text-base text-[var(--semantic-text-primary)]">{record?.displayValue}</p>
          )}
        </div>
        {!isNg && (
          <RecordTimestamp inspector={inspector} timestamp={stamp(record?.displayValue)} />
        )}
      </div>
      <div className="border-t border-[#d0d0d0] w-full" />
      <div className="flex flex-col gap-2 items-start w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{record?.remarks}</p>
      </div>
    </div>
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

function WaterConfirmRow({
  label,
  value,
  timestamp,
  noBorder,
}: {
  label: string;
  value: string;
  timestamp?: string;
  /** トグル行と一組にするとき、区切り線は親側で引くので消す */
  noBorder?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 w-full py-3 ${noBorder ? "" : "border-b border-[#d0d0d0]"}`}>
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
      </div>
      <RecordTimestamp timestamp={value ? timestamp : undefined} />
    </div>
  );
}

function WaterCheckRow({ item, timestamp }: { item: CheckItem; timestamp?: string }) {
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
      <RecordTimestamp timestamp={item.status ? timestamp : undefined} />
    </div>
  );
}

function WaterToggleRow({ label, checked }: { label: string; checked: boolean }) {
  if (!checked) return null;
  return (
    <div className="flex justify-end w-full pb-3">
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

/**
 * 差し戻し詳細の本文エリア。中身を最後まで読んだ（＝下までスクロールした）ことを親に伝える。
 * 中身が 1 画面に収まってスクロールできないときは、最初から読み終わった扱いにする。
 */
function ScrollEndArea({
  className,
  onReachEnd,
  children,
}: {
  className?: string;
  onReachEnd: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 画像の読み込みなどで高さが変わることがあるので、毎レンダーで測り直す
  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollHeight - el.clientHeight <= 8) onReachEnd();
  });

  return (
    <div
      ref={ref}
      className={className}
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight <= 8) onReachEnd();
      }}
    >
      {children}
    </div>
  );
}

type PendingReviewStep =
  | "confirmer"
  | "detail"
  | "repair"
  | "record"
  | "scaleDetail"
  | "scoreDetail"
  | "machineRecordDetail"
  | "confirmation";

export function PendingReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // 「点検内容を修正する」→ 編集画面 → 「編集を保存」で戻ってきたときに、直前の表示ステップを復元する
  const location = useLocation();
  const returnState = location.state as
    | { step?: PendingReviewStep; confirmerId?: string; actorId?: string }
    | null;
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

  const [step, setStep] = useState<PendingReviewStep>(returnState?.step ?? "confirmer");
  const [confirmerId, setConfirmerId] = useState(
    returnState?.confirmerId && CONFIRMERS.some((c) => c.id === returnState.confirmerId)
      ? returnState.confirmerId
      : CONFIRMERS[0].id,
  );
  const [selectedAdditiveRecordId, setSelectedAdditiveRecordId] = useState<string | null>(null);
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
  // 機械器具点検の差し戻し対応（実施者が自分の記録を直す画面）で使う状態
  const [equipmentActorId, setEquipmentActorId] = useState(
    returnState?.actorId && ACTORS.some((a) => a.id === returnState.actorId)
      ? returnState.actorId
      : ACTORS[0].id,
  );
  const [equipmentNewComment, setEquipmentNewComment] = useState("");
  const [equipmentExtraComments, setEquipmentExtraComments] = useState<
    { id: string; authorName: string; timestamp: string; body: string }[]
  >([]);
  const [equipmentResponseComplete, setEquipmentResponseComplete] = useState(false);
  // Figma「下までスクロールしていない時」= 差し戻し内容を最後まで読むまで完了ボタンは押せない
  const [equipmentScrolledToEnd, setEquipmentScrolledToEnd] = useState(false);
  const [comment, setComment] = useState("");
  const [outcome, setOutcome] = useState<"approved" | "rejected">("approved");
  const [showComplete, setShowComplete] = useState(false);
  const [sampleNewComment, setSampleNewComment] = useState("");
  const [sampleExtraComments, setSampleExtraComments] = useState<
    { id: string; authorName: string; timestamp: string; body: string }[]
  >([]);
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
  // 差し戻しは確認者ではなく実施者が対応するので、入口のダイアログも実施者選択になる
  const isEquipmentRejected = isEquipment && review.status === "差し戻し";
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
    setShowComplete(true);
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

    return (
      <>
        <AppHeader title="検体管理" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 pb-4 flex flex-col gap-4 items-center">
          <SampleProductInfo
            productName={sampleDetail.productName}
            expiryDate={sampleDetail.expiryDate}
            lotNumber={sampleDetail.lotNumber}
          />

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
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
                {/* 実施日は記録のヘッダ情報なのでタイムスタンプは付けない（記録画面・確認画面と同じ扱い） */}
                {value && label !== "実施日" && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                    {sampleDetail.inspectorName} {sampleDetail.timestamp}
                  </p>
                )}
                <div className="border-t border-[#d0d0d0] w-full" />
              </div>
            ))}
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-secondary)]">
                {sampleDetail.remarks}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full mt-8">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            </div>

            <CommentInput
              value={sampleNewComment}
              onChange={setSampleNewComment}
              maxLength={255}
              comments={allSampleComments}
              onSend={handleSendSampleComment}
            />
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

        {sampleShowCompleteDialog && (
          <CompleteDialog
            title="提出が完了しました"
            message="ご確認ありがとうございます。"
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
        )}
      </>
    );
  }

  if (step === "confirmer") {
    // 差し戻しは「記録を直す実施者」が入るので、確認者ではなく実施者を選んでもらう
    const pickerPeople = isEquipmentRejected ? ACTORS : CONFIRMERS;
    const pickerSelectedId = isEquipmentRejected ? equipmentActorId : confirmerId;
    const selectPickerPerson = isEquipmentRejected ? setEquipmentActorId : setConfirmerId;
    return (
      <>
        <AppHeader title="確認待ち" />
        <div className="flex-1 flex items-center justify-center">
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => navigate("/app/pending-review")} />
            <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
              <h2 className="text-2xl text-[var(--semantic-text-primary)]">
                {isEquipmentRejected ? "実施者を選んでください" : "確認者を選んでください"}
              </h2>
              <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
                {pickerPeople.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectPickerPerson(c.id)}
                    className={`h-[78px] rounded-lg flex flex-col items-center justify-start pt-2 gap-0 p-4 shadow-[0px_2px_3px_rgba(51,51,51,0.24)] ${
                      pickerSelectedId === c.id
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
          <SampleProductInfo
            productName={sampleDetail.productName}
            expiryDate={sampleDetail.expiryDate}
            lotNumber={sampleDetail.lotNumber}
          />

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
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
                {/* 実施日は記録のヘッダ情報なのでタイムスタンプは付けない（記録画面・確認画面と同じ扱い） */}
                {value && label !== "実施日" && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                    {sampleDetail.inspectorName} {sampleDetail.timestamp}
                  </p>
                )}
                <div className="border-t border-[#d0d0d0] w-full" />
              </div>
            ))}
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-secondary)]">
                {sampleDetail.remarks}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start w-full max-w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            <CommentInput
              value={comment}
              onChange={setComment}
              maxLength={commentMaxLength}
              authorName={confirmer.name}
            />
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
              setShowComplete(true);
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
    // 記録済みのデータなので、実施日から「誰がいつ入れたか」を組み立てて各項目に出す
    const glassPlasticDate = "2025/03/24";

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
            <div className="flex flex-col gap-2 items-start w-full max-w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                異常があった箇所は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「修理完了」ステータスに変更してください。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col gap-6 items-start w-full max-w-full">
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
                setShowComplete(true);
              }}
              className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
            >
              確認
            </button>
          </div>

          {showComplete && (
            <CompleteDialog
              title="確認が完了しました"
              message="ご確認ありがとうございます。"
              buttonLabel="確認待ちに戻る"
              onButtonClick={() => navigate("/app/pending-review")}
            />
          )}
        </>
      );
    }

    return (
      <>
        <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <GlassPlasticMap floorName={floorName} />
          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
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
              <p className="text-base text-[var(--semantic-text-primary)]">{glassPlasticDate}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 flex flex-col gap-10 items-start w-full max-w-full">
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
                        <RecordTimestamp
                          inspector={record?.inspector ?? inspector}
                          timestamp={record?.timestamp || seedTimestamp(glassPlasticDate)}
                        />
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
      setShowComplete(true);
    };
    // 記録に入っている実施者・実施日・点検時間から「誰がいつ入れたか」を組み立てる。
    // 実施者・点検場所・実施日は記録のヘッダ情報なので付けない。
    const waterTimestamp = `${waterRecord.inspector} ${waterRecord.date} ${waterRecord.time}`;

    return (
      <>
        <AppHeader title={`使用水の点検_${waterRecord.location}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex flex-col items-start px-4 py-6 rounded-lg w-full max-w-full">
            <WaterConfirmRow label="実施者" value={waterRecord.inspector} />
            <WaterConfirmRow label="点検場所" value={waterRecord.location} />
            <WaterConfirmRow label="実施日" value={waterRecord.date} />
            {waterRecord.checks.map((item) => (
              <WaterCheckRow key={item.label} item={item} timestamp={waterTimestamp} />
            ))}
            <WaterConfirmRow label="ph値" value={waterRecord.phValue} timestamp={waterTimestamp} />
            {/* 値 → トグル → タイムスタンプ → 区切り線 の順に並べ、記録詳細画面(PointDetailPage)と同じ見た目にする */}
            <div className="flex flex-col w-full">
              <WaterConfirmRow label="残留塩素濃度(mg/ℓ)" value={waterRecord.residualChlorine} noBorder />
              <WaterToggleRow label="塩素補充" checked={waterRecord.chlorineToggle.checked} />
              {(waterRecord.residualChlorine || waterRecord.chlorineToggle.checked) && (
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal pb-3">
                  {waterTimestamp}
                </p>
              )}
              <div className="border-t border-[#d0d0d0]" />
            </div>
            <div className="flex flex-col w-full">
              <WaterConfirmRow label="UV殺菌灯稼働時間(h)" value={waterRecord.uvOperatingHours} noBorder />
              <WaterToggleRow label="UV殺菌灯交換" checked={waterRecord.uvToggle.checked} />
              {(waterRecord.uvOperatingHours || waterRecord.uvToggle.checked) && (
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal pb-3">
                  {waterTimestamp}
                </p>
              )}
              <div className="border-t border-[#d0d0d0]" />
            </div>
            <WaterConfirmRow label="UV表示灯" value={waterRecord.uvIndicatorLight} timestamp={waterTimestamp} />
            <WaterConfirmRow label="異常検出灯" value={waterRecord.errorIndicatorLight} timestamp={waterTimestamp} />
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

        {showComplete && (
          <CompleteDialog
            title="確認が完了しました"
            message="ご確認ありがとうございます。"
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
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

    if (step === "record" && selectedAdditiveRecord) {
      return (
        <>
          <AppHeader title={`添加物管理_${additive.name}`} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4 items-center">
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
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

            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
              {/* 記録画面で項目ごとに付いた「実施者 + 入力時刻」をそのまま出す */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">区分</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {selectedAdditiveRecord.category}
                  </p>
                </div>
                <RecordTimestamp
                  inspector={selectedAdditiveRecord.actor}
                  timestamp={selectedAdditiveRecord.timestamps?.category}
                />
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">数量</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {selectedAdditiveRecord.quantity}
                  </p>
                </div>
                <RecordTimestamp
                  inspector={selectedAdditiveRecord.actor}
                  timestamp={selectedAdditiveRecord.timestamps?.quantity}
                />
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">現在庫数</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {selectedAdditiveRecord.currentStock}
                  </p>
                </div>
                <RecordTimestamp
                  inspector={selectedAdditiveRecord.actor}
                  timestamp={selectedAdditiveRecord.timestamps?.currentStock}
                />
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
                <p className="text-base font-normal leading-[1.6] text-[var(--semantic-text-primary)]">
                  {selectedAdditiveRecord.remarks}
                </p>
              </div>
            </div>

            <CommentInput
              value={comment}
              onChange={setComment}
              maxLength={commentMaxLength}
              authorName={confirmer.name}
            />
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
          <div className="flex items-center justify-between w-full max-w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">2025/04/01</p>
          </div>

          <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full">
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
            onClick={handleApprove}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            提出
          </button>
        </div>

        {showComplete && (
          <CompleteDialog
            title={outcome === "rejected" ? "差し戻しが完了しました" : "提出が完了しました"}
            message={
              outcome === "rejected"
                ? "実施者に差し戻し内容が通知されます。"
                : "ご確認ありがとうございます。"
            }
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
        )}
      </>
    );
  }

  if (isScaleInspection) {
    const postName = review.name;
    const scales = pendingReviewScales;
    const ngScales = scales.filter((s) => s.record?.actionCheck === "ng");

    function handleScaleNext() {
      if (ngScales.length > 0) {
        setStep("repair");
      } else {
        setOutcome("approved");
        setShowComplete(true);
      }
    }

    function handleScaleSubmit() {
      setOutcome("approved");
      setShowComplete(true);
    }

    if (step === "repair") {
      return (
        <>
          <AppHeader title="秤点検記録" />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="flex flex-col gap-2 items-start w-full max-w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                異常があった秤は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「修理完了」ステータスに変更してください。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 flex flex-col gap-6 items-start w-full max-w-full">
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

          {showComplete && (
            <CompleteDialog
              title="確認が完了しました"
              message="ご確認ありがとうございます。"
              buttonLabel="確認待ちに戻る"
              onButtonClick={() => navigate("/app/pending-review")}
            />
          )}
        </>
      );
    }

    return (
      <>
        <AppHeader title="秤点検記録" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
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

          {scales.map((scale) => (
            <ScaleRecordCard
              key={scale.id}
              scale={scale}
              inspectorName={scalePendingReviewPost.inspectorName}
              recordDate={scalePendingReviewPost.date}
            />
          ))}

          <div className="flex flex-col gap-2 items-start w-full max-w-full">
            <p className="text-lg text-[var(--semantic-text-primary)]">コメント</p>
            <CommentInput
              value={scaleComment}
              onChange={setScaleComment}
              maxLength={commentMaxLength}
              authorName={confirmer.name}
            />
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

        {showComplete && (
          <CompleteDialog
            title="確認が完了しました"
            message="ご確認ありがとうございます。"
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
        )}
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
      setShowComplete(true);
    }

    if (step === "scoreDetail" && selectedRow) {
      // 記録済みのデータなので、実施日から「誰がいつ入れたか」を組み立てて各項目に出す。
      // 実施者・実施日は記録のヘッダ情報なので付けない。
      const rowTimestamp = seedTimestamp(selectedRow.date);
      return (
        <>
          <AppHeader title="官能検査記録" />
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
            <div className="bg-white flex flex-wrap gap-2 items-center p-4 rounded-lg w-full max-w-full">
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

            <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
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
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">製造日</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {selectedRow.manufactureDate.replaceAll("-", "/")}
                  </p>
                </div>
                <RecordTimestamp
                  inspector={selectedRow.inspectorName}
                  timestamp={selectedRow.manufactureDate ? rowTimestamp : undefined}
                />
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">比較商品</p>
                  <p className="text-base text-[var(--semantic-text-primary)]">
                    {selectedRow.comparison === "present" ? "比較商品あり" : "比較商品なし"}
                  </p>
                </div>
                <RecordTimestamp inspector={selectedRow.inspectorName} timestamp={rowTimestamp} />
              </div>
              {selectedRow.comparison === "present" && (
                <>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-base text-[var(--semantic-text-primary)]">比較商品製造日</p>
                      <p className="text-base text-[var(--semantic-text-primary)]">
                        {selectedRow.comparisonManufactureDate.replaceAll("-", "/")}
                      </p>
                    </div>
                    <RecordTimestamp
                      inspector={selectedRow.inspectorName}
                      timestamp={selectedRow.comparisonManufactureDate ? rowTimestamp : undefined}
                    />
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
                    <RecordTimestamp
                      inspector={selectedRow.inspectorName}
                      timestamp={score ? rowTimestamp : undefined}
                    />
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
          <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
            <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
            <p className="text-sm text-[var(--semantic-text-primary)]">
              実施予定者に足りていない時はコメント欄に記載してください。
            </p>
          </div>

          <div className="bg-white flex flex-wrap gap-2 items-center p-4 rounded-lg w-full max-w-full">
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

          <div className="flex flex-col gap-4 items-end w-full max-w-full">
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

          <div className="flex flex-col gap-2 items-start w-full max-w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            <CommentInput
              value={comment}
              onChange={setComment}
              maxLength={commentMaxLength}
              authorName={confirmer.name}
            />
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

        {showComplete && (
          <CompleteDialog
            title={outcome === "rejected" ? "差し戻しが完了しました" : "確認が完了しました"}
            message={
              outcome === "rejected"
                ? "実施者に差し戻し内容が通知されます。"
                : "ご確認ありがとうございます。"
            }
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
        )}
      </>
    );
  }

  if (isMetalXray && machine) {
    const machineRecords = MACHINE_RECORDS[machine.id] ?? [];
    const inspectionDate = MACHINE_INSPECTION_DATES[machine.id] ?? "";
    const selectedMachineRecord = machineRecords.find((r) => r.id === selectedMachineRecordId);

    function handleMetalXraySubmit() {
      setOutcome("approved");
      setShowComplete(true);
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
            <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full max-w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {inspectionDate ? inspectionDate.replaceAll("-", "/") : ""}
              </p>
            </div>

            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
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
                {record.time && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                    {recordTimestamp}
                  </p>
                )}
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
                      className="h-6 w-16 rounded-lg text-xs text-white inline-flex items-center justify-center"
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
                  {record.remarks}
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
        // 点検の編集画面へ。「編集を保存」でこの詳細画面（同じステップ）に戻ってくる
        navigate(`/app/ledger-list/metal-xray-detection/machines/${machine.id}`, {
          state: {
            inspectorName: actor.name,
            editReturn: { to: location.pathname, state: { step, confirmerId } },
          },
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
                          className="h-6 w-16 rounded-lg text-xs text-white inline-flex items-center justify-center"
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
              <div className="flex h-11 items-center justify-between w-full">
                <p className="text-lg font-semibold text-[var(--semantic-text-primary)]">コメント</p>
                <button
                  type="button"
                  onClick={openMetalXrayActorPicker}
                  className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center justify-center h-11 p-3 rounded-lg text-lg font-semibold leading-none text-[var(--semantic-brand-primary)] whitespace-nowrap"
                >
                  <img src={iconEdit} alt="" className="size-5" />
                  点検内容を修正する
                </button>
              </div>

              <CommentInput
                value={metalXrayNewComment}
                onChange={setMetalXrayNewComment}
                maxLength={255}
                comments={allMetalXrayComments}
                onSend={handleSendMetalXrayComment}
              />
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
            {/* コメントや点検内容の修正をしていなくても押せる（差し戻し内容の確認だけで完了できる） */}
            <button
              type="button"
              onClick={() => setMetalXrayResponseComplete(true)}
              className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
            >
              差し戻し対応完了
            </button>
          </div>

          {metalXrayActorPickerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMetalXrayActorPickerOpen(false)} />
              {/* 帳票一覧・進捗一覧の実施者選択と同じ見た目（640×738 / 3列グリッド） */}
              <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
                <h2 className="text-2xl text-[var(--semantic-text-primary)]">実施者を選んでください</h2>
                <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto flex-1">
                  {ACTORS.map((actor) => (
                    <button
                      key={actor.id}
                      type="button"
                      onClick={() => setSelectedMetalXrayActorId(actor.id)}
                      className={`h-[78px] rounded-lg flex flex-col items-center justify-start pt-2 gap-0 p-4 shadow-[0px_2px_3px_rgba(51,51,51,0.24)] ${
                        selectedMetalXrayActorId === actor.id
                          ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                          : "bg-white border-2 border-transparent"
                      }`}
                    >
                      <span className="text-base text-[var(--semantic-text-primary)]">{actor.name}</span>
                      <span className="text-sm text-[var(--semantic-text-secondary)]">{actor.id}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-10 items-center justify-center w-full">
                  <button
                    type="button"
                    onClick={() => setMetalXrayActorPickerOpen(false)}
                    className="bg-white border-2 border-[#333] h-16 w-60 rounded-lg text-xl text-[#333] font-semibold hover:bg-gray-50"
                  >
                    閉じる
                  </button>
                  <button
                    type="button"
                    onClick={confirmMetalXrayActorPicker}
                    className="bg-[#094] h-16 w-60 rounded-lg text-xl text-white font-semibold hover:bg-[#076a38]"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          )}

          {metalXrayResponseComplete && (
            <CompleteDialog
              title="差し戻し対応が完了しました"
              message="ご確認ありがとうございます。"
              buttonLabel="確認待ちに戻る"
              onButtonClick={() => navigate("/app/pending-review")}
            />
          )}
        </>
      );
    }

    return (
      <>
        <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
          <div className="bg-white flex items-center justify-between p-4 rounded-lg w-full max-w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {inspectionDate ? inspectionDate.replaceAll("-", "/") : ""}
            </p>
          </div>

          <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full">
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
                        className="h-6 w-16 rounded-lg text-xs text-white inline-flex items-center justify-center"
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

          <div className="flex flex-col gap-2 items-start w-full max-w-full mt-12">
            <p className="text-lg font-semibold text-[var(--semantic-text-primary)]">コメント</p>

            <CommentInput
              value={metalXrayComment}
              onChange={setMetalXrayComment}
              maxLength={commentMaxLength}
              comments={[
                ...(MACHINE_REJECTION_COMMENTS[machine.id] ?? []),
                ...metalXrayExtraComments,
              ]}
              onSend={() => {
                if (!metalXrayComment.trim()) return;
                setMetalXrayExtraComments((prev) => [
                  ...prev,
                  {
                    id: `local-${prev.length}`,
                    authorName: confirmer.name,
                    timestamp: commentTimestamp(),
                    body: metalXrayComment.trim(),
                  },
                ]);
                setMetalXrayComment("");
              }}
            />
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

        {showComplete && (
          <CompleteDialog
            title="提出が完了しました"
            message="ご確認ありがとうございます。"
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
        )}
      </>
    );
  }

  // 機械器具点検の差し戻し（Figma: 確認待ち_差し戻し_機械器具点検_詳細）。
  // 実施者が差し戻し理由を読み、必要なら点検内容を直してから「差し戻し対応完了」を押す。
  if (isEquipmentRejected && line) {
    const actor = ACTORS.find((a) => a.id === equipmentActorId) ?? ACTORS[0];
    const rejectionComments = LINE_REJECTION_COMMENTS[line.id] ?? [];
    const allEquipmentComments = [...rejectionComments, ...equipmentExtraComments];

    const handleSendEquipmentComment = () => {
      if (!equipmentNewComment.trim()) return;
      setEquipmentExtraComments((prev) => [
        ...prev,
        {
          id: `local-${prev.length}`,
          authorName: actor.name,
          timestamp: commentTimestamp(),
          body: equipmentNewComment.trim(),
        },
      ]);
      setEquipmentNewComment("");
    };

    // 点検の編集画面へ。「編集を保存」でこの詳細画面（同じステップ）に戻ってくる
    const goToEdit = () => {
      navigate(`/app/ledger-list/equipment-inspection/lines/${line.id}`, {
        state: {
          inspectorName: actor.name,
          editReturn: { to: location.pathname, state: { step, actorId: equipmentActorId } },
        },
      });
    };

    return (
      <>
        <AppHeader title="機械器具点検" />
        {/* 差し戻し内容を最後まで読むまで完了ボタンは押せない（Figma「下までスクロールしていない時」＝非活性） */}
        <ScrollEndArea
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center"
          onReachEnd={() => setEquipmentScrolledToEnd(true)}
        >
          <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
            <img src={iconAttention} alt="注意" className="size-6 shrink-0" />
            <p className="text-sm text-[var(--semantic-text-primary)]">
              承認者から差し戻し理由のコメントがあります。
            </p>
          </div>

          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">2025/04/01</p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{actor.name}</p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">持ち場/ライン</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{lineLabel}</p>
            </div>
          </div>

          {(["start", "end"] as const).map((tab) => (
            <div
              key={tab}
              className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full"
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
                            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
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
                  {tab === "start" ? initialRemarks : ""}
                </p>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2 items-start w-full max-w-full mt-12">
            <div className="flex h-11 items-center justify-between w-full">
              <p className="text-lg font-semibold text-[var(--semantic-text-primary)]">コメント</p>
              <button
                type="button"
                onClick={goToEdit}
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center justify-center h-11 p-3 rounded-lg text-lg font-semibold leading-none text-[var(--semantic-brand-primary)] whitespace-nowrap"
              >
                <img src={iconEdit} alt="" className="size-5" />
                点検内容を修正する
              </button>
            </div>

            <CommentInput
              value={equipmentNewComment}
              onChange={setEquipmentNewComment}
              maxLength={255}
              comments={allEquipmentComments}
              onSend={handleSendEquipmentComment}
            />
          </div>
        </ScrollEndArea>

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
            disabled={!equipmentScrolledToEnd}
            onClick={() => setEquipmentResponseComplete(true)}
            className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
              equipmentScrolledToEnd ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
            }`}
          >
            差し戻し対応完了
          </button>
        </div>

        {equipmentResponseComplete && (
          <CompleteDialog
            title="差し戻し対応が完了しました"
            message="ご確認ありがとうございます。"
            buttonLabel="確認待ちに戻る"
            onButtonClick={() => navigate("/app/pending-review")}
          />
        )}
      </>
    );
  }

  return (
    <>
      <AppHeader title={`${isCleaning ? "清掃記録" : "機械器具点検"}_${lineLabel}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
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
                className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full"
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
                          <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
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
                className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full"
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
                              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
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
                    {tab === "start" ? initialRemarks : ""}
                  </p>
                </div>
              </div>
            ))}

        {isCleaning && (
          <div className="bg-white flex flex-col gap-2 items-start px-4 py-6 rounded-lg w-full max-w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-secondary)]">
              {cleaningInitialRemarks}
            </p>
          </div>
        )}

        <CommentInput
          value={comment}
          onChange={setComment}
          maxLength={commentMaxLength}
          authorName={confirmer.name}
        />
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
          onClick={handleApprove}
          className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>

      {showComplete && (
        <CompleteDialog
          title={outcome === "rejected" ? "差し戻しが完了しました" : "提出が完了しました"}
          message={
            outcome === "rejected"
              ? "実施者に差し戻し内容が通知されます。"
              : "ご確認ありがとうございます。"
          }
          buttonLabel="確認待ちに戻る"
          onButtonClick={() => navigate("/app/pending-review")}
        />
      )}
    </>
  );
}
