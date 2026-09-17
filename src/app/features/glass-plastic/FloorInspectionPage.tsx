import { useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import iconExpand from "../../../assets/figma/icons/common/expansion.svg";
import iconReduce from "../../../assets/figma/icons/common/reduction.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import { DateFilterInput } from "../../components/DateFilterInput";
import { recordTimestamp, todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { AppHeader } from "../../layout/AppHeader";
import { useGlassPlastic } from "./GlassPlasticContext";
import { ACTORS } from "../cleaning-record/mockData";
import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import {
  ACTION_OPTIONS,
  CAUSE_OPTIONS,
  CONTENT_OPTIONS,
  ITEM_BADGE_COLORS,
  ITEM_BADGE_LABELS,
  initialInspectionRecords,
  rooms,
  type ActionOption,
  type CauseOption,
  type ContentOption,
  type RoomItemRecord,
  type RoomItemStatus,
} from "./mockData";

function keyFor(roomName: string, itemName: string) {
  return `${roomName}|${itemName}`;
}

/** 画面に出る順の点検項目キー（修理中・要対応のバッジ項目は入力対象外なので除く） */
function orderedRecordKeys() {
  return rooms.flatMap((room) =>
    room.items.filter((item) => !item.badge).map((item) => keyFor(room.name, item.name)),
  );
}

/**
 * ステータスに応じた記録の初期状態。
 * モックに個別の記録がある項目はそれを、無い項目は「正常」として扱う。
 */
function seedRecords(
  fill: RecordFill,
  inspectorName: string,
  inspectionDate?: string,
): Record<string, RoomItemRecord> {
  // 点検済み・確認完了の記録は実施者だけでなく入力時刻まで入った状態にする
  // （実施日から組み立てる。項目ごとの時刻はモックに無いので一律の時刻を使う）
  const timestamp = inspectionDate ? `${inspectionDate.replace(/-/g, "/")} 09:00` : "";
  return Object.fromEntries(
    fillSlice(orderedRecordKeys(), fill).map((key) => [
      key,
      initialInspectionRecords[key] ?? {
        status: "ok" as const,
        content: null,
        cause: null,
        actionType: null,
        actionDetail: "",
        timestamp,
        inspector: inspectorName,
      },
    ]),
  );
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 px-4 rounded-lg text-base shrink-0 whitespace-nowrap ${
        selected
          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
          : "bg-white text-[var(--semantic-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export function FloorInspectionPage() {
  const { floors, setCurrentFloorRecords } = useGlassPlastic();
  const { floorId } = useParams<{ floorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;

  const floor = floors.find((f) => f.id === floorId);
  const floorName = floor?.name ?? "フロアA";

  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const floorFill: RecordFill = floor?.status === "inspected" ? "full" : "none";
  const fill = progressFill ?? floorFill;

  const [date, setDate] = useState(() =>
    fill !== "none" ? floor?.inspectionDate || todayString() : todayString(),
  );
  const [activeRoomId, setActiveRoomId] = useState("all");
  const [mapScale, setMapScale] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [records, setRecords] = useState<Record<string, RoomItemRecord>>(() =>
    seedRecords(fill, floor?.inspectorName ?? inspectorName, floor?.inspectionDate),
  );

  const [ngTarget, setNgTarget] = useState<{ roomName: string; itemName: string } | null>(null);
  const [ngStatus, setNgStatus] = useState<RoomItemStatus>("ng");
  const [ngContent, setNgContent] = useState<ContentOption | null>(null);
  const [ngContentDetail, setNgContentDetail] = useState("");
  const [ngCause, setNgCause] = useState<CauseOption | null>(null);
  const [ngCauseDetail, setNgCauseDetail] = useState("");
  const [ngActionType, setNgActionType] = useState<ActionOption | null>(null);
  const [ngActionDetail, setNgActionDetail] = useState("");

  const visibleRooms = activeRoomId === "all" ? rooms : rooms.filter((room) => room.id === activeRoomId);

  // 異常にした項目は内容・原因・対応まで入っていること
  const allItemsComplete = rooms.every((room) =>
    room.items.every((item) => {
      if (item.badge) return true;
      const record = records[keyFor(room.name, item.name)];
      if (!record || record.status !== "ng") return true;
      return Boolean(record.content && record.cause && record.actionType);
    })
  );
  // まだ 1 項目も点検していないうちは確認画面へ進めない
  // （allItemsComplete は「異常の項目に不足が無いか」しか見ないので、空でも true になる）
  const hasInput = Object.keys(records).length > 0;
  const canProceed = allItemsComplete && hasInput;

  function setStatus(
    roomName: string,
    itemName: string,
    status: RoomItemStatus,
    detail?: { content: ContentOption; cause: CauseOption; actionType: ActionOption; actionDetail: string }
  ) {
    const key = keyFor(roomName, itemName);
    setRecords((prev) => ({
      ...prev,
      [key]: {
        status,
        content: detail?.content ?? null,
        cause: detail?.cause ?? null,
        actionType: detail?.actionType ?? null,
        actionDetail: detail?.actionDetail ?? "",
        timestamp: recordTimestamp(),
        inspector: inspectorName,
      },
    }));
  }

  function openNgDialog(roomName: string, itemName: string) {
    const existing = records[keyFor(roomName, itemName)];
    setNgTarget({ roomName, itemName });
    setNgStatus("ng");
    setNgContent(existing?.content ?? null);
    setNgContentDetail("");
    setNgCause(existing?.cause ?? null);
    setNgCauseDetail("");
    setNgActionType(existing?.actionType ?? null);
    setNgActionDetail(existing?.actionDetail ?? "");
  }

  function closeNgDialog() {
    setNgTarget(null);
    setNgContentDetail("");
    setNgCauseDetail("");
  }

  function confirmNgDialog() {
    if (!ngTarget) return;
    if (ngStatus === "ng") {
      if (!ngContent || !ngCause || !ngActionType) return;
      setStatus(ngTarget.roomName, ngTarget.itemName, "ng", {
        content: ngContent,
        cause: ngCause,
        actionType: ngActionType,
        actionDetail: ngActionDetail,
      });
    } else {
      setStatus(ngTarget.roomName, ngTarget.itemName, "ok");
    }
    closeNgDialog();
  }

  function goToConfirm() {
    setCurrentFloorRecords(records);
    navigate(`/app/ledger-list/glass-plastic/floors/${floorId}/confirm`, {
      state: { floorName, date, records, inspectorName },
    });
  }

  return (
    <>
      <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <DateFilterInput value={date} onChange={setDate} />
          </div>

          <div
            className={`relative shrink-0 bg-[#d0d0d0] border border-[var(--semantic-brand-primary)] rounded-lg overflow-auto flex items-center justify-center ${
              mapExpanded ? "h-[640px]" : "h-[340px]"
            }`}
          >
            <button
              type="button"
              onClick={() => setMapExpanded((expanded) => !expanded)}
              aria-label={mapExpanded ? "縮小表示" : "拡大表示"}
              className={`absolute top-4 left-4 size-10 rounded-[10px] flex items-center justify-center text-lg z-10 shadow-[0px_2px_3px_rgba(51,51,51,0.24)] ${
                mapExpanded ? "bg-[var(--semantic-brand-primary)]" : "bg-white"
              }`}
            >
              <span
                className="size-6"
                style={{
                  WebkitMaskImage: `url("${mapExpanded ? iconReduce : iconExpand}")`,
                  maskImage: `url("${mapExpanded ? iconReduce : iconExpand}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: mapExpanded ? "#ffffff" : "#009944",
                }}
              />
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
                <span
                  className="size-6"
                  style={{
                    WebkitMaskImage: `url("${iconPlus}")`,
                    maskImage: `url("${iconPlus}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "#009944",
                  }}
                />
              </button>
              <button
                type="button"
                onClick={() => setMapScale((s) => Math.max(s - 0.2, 0.6))}
                className="bg-white w-10 h-10 flex items-center justify-center text-xl"
              >
                <span
                  className="size-6"
                  style={{
                    WebkitMaskImage: `url("${iconMinus}")`,
                    maskImage: `url("${iconMinus}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "#009944",
                  }}
                />
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto">
            {[{ id: "all", name: "すべて" }, ...rooms].map((room) => {
              const active = activeRoomId === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  className={`shrink-0 h-12 px-6 border-b-2 text-base whitespace-nowrap ${
                    active
                      ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                      : "border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                  }`}
                >
                  {room.name}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-lg p-4 flex flex-col gap-10 items-start w-full">
            {visibleRooms.map((room) => (
              <div key={room.id} className="flex flex-col gap-4 items-start w-full">
                <p className="text-xl text-[var(--semantic-brand-primary)]">{room.name}</p>
                <div className="flex flex-col gap-5 items-start w-full">
                  {room.items.map((item) => {
                    if (item.badge) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between w-full gap-4"
                        >
                          <p className="flex-1 text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                            {item.name} <span className="text-[var(--semantic-brand-danger)]">※</span>
                          </p>
                          <span
                            className="h-12 w-40 rounded-lg flex items-center justify-center text-lg text-white shrink-0"
                            style={{ backgroundColor: ITEM_BADGE_COLORS[item.badge] }}
                          >
                            {ITEM_BADGE_LABELS[item.badge]}
                          </span>
                        </div>
                      );
                    }

                    const record = records[keyFor(room.name, item.name)];
                    const status = record?.status ?? null;

                    return (
                      <div key={item.name} className="flex flex-col gap-2 items-start w-full">
                        <div className="flex items-center justify-between w-full gap-4">
                          <p className="flex-1 text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                            {item.name} <span className="text-[var(--semantic-brand-danger)]">※</span>
                          </p>
                          <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                            <button
                              type="button"
                              onClick={() => openNgDialog(room.name, item.name)}
                              className={`h-12 w-20 flex items-center justify-center text-white ${
                                status === "ng" ? "bg-[#f85c5c]" : "bg-[#d0d0d0]"
                              }`}
                            >
                              <img src={iconXMark} alt="異常あり" className="size-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(room.name, item.name, "ok")}
                              className={`h-12 w-20 flex items-center justify-center text-white ${
                                status === "ok" ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                              }`}
                            >
                              <img src={iconCheck} alt="正常" className="size-5" />
                            </button>
                          </div>
                        </div>

                        {status === "ng" && (record?.content || record?.cause || record?.actionType) && (
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
                          inspector={record?.inspector}
                          timestamp={record?.timestamp}
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
            onClick={() => navigate(-1)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            戻る
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={goToConfirm}
            className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
              canProceed ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
            }`}
          >
            確認画面へ
          </button>
        </div>
      </div>

      {ngTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeNgDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-8 py-10 w-full max-w-[1040px] mx-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検箇所
              </h2>
              <div className="flex items-center justify-between w-full gap-4">
                <p className="text-xl text-[var(--semantic-text-primary)] flex items-center gap-1">
                  {ngTarget.itemName} <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setNgStatus("ng")}
                    className={`h-12 w-20 flex items-center justify-center text-white ${
                      ngStatus === "ng" ? "bg-[#f85c5c]" : "bg-[#d0d0d0]"
                    }`}
                  >
                    <img src={iconXMark} alt="異常あり" className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNgStatus("ok")}
                    className={`h-12 w-20 flex items-center justify-center text-white ${
                      ngStatus === "ok" ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                    }`}
                  >
                    <img src={iconCheck} alt="正常" className="size-5" />
                  </button>
                </div>
              </div>
              {ngStatus === "ng" && (
                <>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      内容 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <div className="flex flex-wrap gap-4 w-full">
                      {CONTENT_OPTIONS.map((option) => (
                        <PillButton
                          key={option}
                          selected={ngContent === option}
                          onClick={() => setNgContent(option)}
                        >
                          {option}
                        </PillButton>
                      ))}
                    </div>
                    {ngContent === "その他" && (
                      <textarea
                        value={ngContentDetail}
                        onChange={(e) => setNgContentDetail(e.target.value)}
                        placeholder="その他の場合は内容を記入してください。"
                        className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <div className="flex flex-wrap gap-4 w-full">
                      {CAUSE_OPTIONS.map((option) => (
                        <PillButton
                          key={option}
                          selected={ngCause === option}
                          onClick={() => setNgCause(option)}
                        >
                          {option}
                        </PillButton>
                      ))}
                    </div>
                    {ngCause === "その他" && (
                      <textarea
                        value={ngCauseDetail}
                        onChange={(e) => setNgCauseDetail(e.target.value)}
                        placeholder="その他の場合は原因を記入してください。"
                        className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      対応 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <div className="flex flex-wrap gap-4 w-full">
                      {ACTION_OPTIONS.map((option) => (
                        <PillButton
                          key={option}
                          selected={ngActionType === option}
                          onClick={() => setNgActionType(option)}
                        >
                          {option}
                        </PillButton>
                      ))}
                    </div>
                    {ngActionType === "その他" && (
                      <textarea
                        value={ngActionDetail}
                        onChange={(e) => setNgActionDetail(e.target.value)}
                        placeholder="その他の場合は対応内容を記入してください。"
                        className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeNgDialog}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={ngStatus === "ng" && (!ngContent || !ngCause || !ngActionType)}
                onClick={confirmNgDialog}
                className={`h-16 w-60 rounded-lg text-xl text-white ${
                  ngStatus === "ok" || (ngContent && ngCause && ngActionType)
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
