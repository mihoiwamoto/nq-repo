import { Fragment, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { useGlassPlastic } from "./GlassPlasticContext";
import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import iconExpand from "../../../assets/figma/icons/common/expansion.svg";
import iconReduce from "../../../assets/figma/icons/common/reduction.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import {
  rooms,
  ITEM_BADGE_COLORS,
  ITEM_BADGE_LABELS,
  type RoomItem,
  type RoomItemRecord,
} from "./mockData";

function keyFor(roomName: string, itemName: string) {
  return `${roomName}|${itemName}`;
}

function StatusTag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="flex h-6 w-16 shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

/** 項目1件ぶんのステータスタグ。修理中・要対応のバッジ項目はバッジをそのまま出す。 */
function ItemStatusTag({ item, record }: { item: RoomItem; record?: RoomItemRecord }) {
  if (item.badge) {
    return <StatusTag label={ITEM_BADGE_LABELS[item.badge]} color={ITEM_BADGE_COLORS[item.badge]} />;
  }
  if (record?.status === "ng") {
    return <StatusTag label="異常あり" color="var(--semantic-status-error)" />;
  }
  if (record?.status === "ok") {
    return <StatusTag label="正常" color="var(--semantic-status-success)" />;
  }
  // 未入力の項目はデザインに定義が無いため、他画面の「修理しない」と同じグレーに合わせる
  return <StatusTag label="未確認" color="var(--semantic-text-secondary)" />;
}

/** 「内容：選択肢01 / 補足テキスト」のような1行。値が無ければ出さない。 */
function DetailLine({ label, value, detail }: { label: string; value?: string | null; detail?: string }) {
  if (!value && !detail) return null;
  return (
    <div className="flex items-start w-full">
      <p className="shrink-0 whitespace-nowrap leading-[1.4]">{label}：</p>
      <div className="flex flex-1 flex-col gap-1 min-w-px">
        {value && <p className="leading-[1.4]">{value}</p>}
        {detail && <p className="leading-[1.4]">{detail}</p>}
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
      <p className="text-base text-[var(--semantic-text-primary)]">{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[#d0d0d0] w-full" />;
}

export function FloorInspectionConfirmPage() {
  const { floorId } = useParams<{ floorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentFloorRecords } = useGlassPlastic();
  const state = location.state as {
    floorName?: string;
    date?: string;
    records?: Record<string, RoomItemRecord>;
    inspectorName?: string;
  } | null;

  const floorName = state?.floorName ?? "フロアA";
  const date = state?.date ?? "2025/03/24";
  const inspectorName = state?.inspectorName ?? "未設定";
  const records = state?.records ?? currentFloorRecords;

  const [mapScale, setMapScale] = useState(1);
  const [mapExpanded, setMapExpanded] = useState(false);

  function handleSave() {
    navigate(`/app/ledger-list/glass-plastic/floors/${floorId}/complete`, {
      state: { floorName, date, inspectorName },
    });
  }

  return (
    <>
      <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4">
          <div className="bg-[#f7f292] rounded-lg p-4 flex items-center gap-2 text-sm text-[var(--semantic-text-primary)]">
            <span
              className="size-6 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconAttention}")`,
                maskImage: `url("${iconAttention}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "#333333",
              }}
            />
            <span>実施者、入力内容に誤りがないか提出前にご確認ください。</span>
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

          {/* ConfirmList: 実施情報と点検結果をひとつのカードにまとめる */}
          <div className="bg-white rounded-lg px-4 py-6 flex flex-col gap-3">
            <ConfirmRow label="実施者" value={inspectorName} />
            <Divider />
            <ConfirmRow label="点検場所" value={floorName} />
            <Divider />
            <ConfirmRow label="実施日" value={date} />
            <Divider />

            <div className="flex flex-col gap-6 w-full">
              {rooms.map((room) => (
                <div key={room.id} className="flex flex-col gap-3 w-full">
                  <p className="text-lg leading-[1.4] text-[var(--semantic-brand-primary)]">{room.name}</p>
                  <div className="flex flex-col gap-3 w-full">
                    {room.items.map((item, index) => {
                      const record = records?.[keyFor(room.name, item.name)];
                      const showDetail =
                        !item.badge &&
                        record?.status === "ng" &&
                        Boolean(record.content || record.cause || record.actionType || record.actionDetail);

                      return (
                        <Fragment key={item.name}>
                          {index > 0 && <Divider />}
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between gap-4 w-full">
                              <p className="text-base text-[var(--semantic-text-primary)]">{item.name}</p>
                              <ItemStatusTag item={item} record={record} />
                            </div>
                            {showDetail && (
                              <div className="flex flex-col gap-2 px-2 w-full text-base text-[var(--semantic-text-secondary)]">
                                <DetailLine label="内容" value={record?.content} />
                                <DetailLine label="原因" value={record?.cause} />
                                <DetailLine label="対応" value={record?.actionType} detail={record?.actionDetail} />
                              </div>
                            )}
                            {/* 点検画面で項目ごとに付いた「実施者 + 入力時刻」をそのまま持ち越す */}
                            <RecordTimestamp
                              inspector={record?.inspector ?? inspectorName}
                              timestamp={record?.timestamp}
                            />
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
            onClick={handleSave}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}
