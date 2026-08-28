import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import { useRecords } from "./RecordsContext";
import { GLASS_PLASTIC_STATUS_COLORS, GLASS_PLASTIC_STATUS_LABELS, type GlassPlasticItemStatus } from "./types";

const STATUS_ORDER: GlassPlasticItemStatus[] = ["normal", "issue", "repairing"];

type TabType = "all" | "room";
type RoomTab = "all" | string;

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

export function RecordDetailPage() {
  const { factoryId, floorId, recordId } = useParams<{
    factoryId: string;
    floorId: string;
    recordId: string;
  }>();
  const { records, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/glass-plastic/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);
  const [activeFilters, setActiveFilters] = useState<GlassPlasticItemStatus[]>([]);
  const [mapScale, setMapScale] = useState(1);
  const [comment, setComment] = useState(record?.comment ?? "");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  function toggleFilter(status: GlassPlasticItemStatus) {
    setActiveFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  const visibleRooms = record.rooms
    .map((room) => ({
      ...room,
      items:
        activeFilters.length === 0
          ? room.items
          : room.items.filter((item) => activeFilters.includes(item.status)),
    }))
    .filter((room) => room.items.length > 0);

  const uniqueRooms = Array.from(new Set(record?.rooms.map((r) => r.name) ?? []));

  const filteredRoomsData = selectedRoom && selectedRoom !== "all"
    ? record?.rooms.filter((r) => r.name === selectedRoom) ?? []
    : record?.rooms ?? [];

  const visibleRoomsForDisplay = filteredRoomsData
    .map((room) => ({
      ...room,
      items:
        activeFilters.length === 0
          ? room.items
          : room.items.filter((item) => activeFilters.includes(item.status)),
    }))
    .filter((room) => room.items.length > 0);

  return (
    <div>
      <PageTitleBar title="データ詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/glass-plastic" },
          { label: "点検場所選択", to: basePath },
          { label: "データ一覧", to: `${basePath}/floors/${floorId}` },
          { label: "データ詳細" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6 bg-[#f5f5f5] min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--semantic-text-primary)]">{factoryName}</h1>
          <div className="bg-white flex items-center gap-2 px-4 py-2 rounded-lg">
            <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
            <svg className="w-6 h-6 text-[var(--semantic-brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="relative bg-[#d0d0d0] border-2 border-[var(--semantic-brand-primary)] rounded-lg h-[500px] flex items-center justify-center overflow-hidden w-full shadow-md">
          <img
            src={floorMapImage}
            alt={`${record?.floorName}の配置図`}
            style={{ transform: `scale(${mapScale})` }}
            className="h-full w-full object-contain transition-transform"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
            <button
              type="button"
              onClick={() => setMapScale((s) => Math.min(s + 0.2, 2))}
              className="bg-white w-10 h-10 flex items-center justify-center text-2xl font-bold text-[var(--semantic-brand-primary)] border-b border-[#d0d0d0]"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setMapScale((s) => Math.max(s - 0.2, 0.6))}
              className="bg-white w-10 h-10 flex items-center justify-center text-2xl font-bold text-[var(--semantic-brand-primary)]"
            >
              −
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-[#d0d0d0]">
          <button
            onClick={() => setSelectedRoom(null)}
            className={`px-4 py-2 font-semibold text-base transition-colors ${
              selectedRoom === null
                ? "text-[var(--semantic-brand-primary)] border-b-2 border-[var(--semantic-brand-primary)]"
                : "text-[var(--semantic-text-secondary)]"
            }`}
          >
            すべて
          </button>
          {uniqueRooms.map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-4 py-2 font-semibold text-base transition-colors ${
                selectedRoom === room
                  ? "text-[var(--semantic-brand-primary)] border-b-2 border-[var(--semantic-brand-primary)]"
                  : "text-[var(--semantic-text-secondary)]"
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex gap-2 items-center mb-6">
            <p className="text-sm font-semibold text-[var(--semantic-brand-primary)]">絞り込み：</p>
            <div className="flex gap-2 items-center">
              {STATUS_ORDER.map((status) => {
                const active = activeFilters.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleFilter(status)}
                    className="h-7 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={
                      active
                        ? { backgroundColor: GLASS_PLASTIC_STATUS_COLORS[status], color: "white" }
                        : { border: "1px solid var(--semantic-text-secondary)", color: "var(--semantic-text-secondary)" }
                    }
                  >
                    {GLASS_PLASTIC_STATUS_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {visibleRoomsForDisplay.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">該当する点検箇所がありません</p>
          ) : (
            visibleRoomsForDisplay.map((room, roomIndex) => (
              <div key={room.id} className="flex flex-col gap-4 items-start w-full">
                {roomIndex > 0 && <div className="border-t border-[#d0d0d0] w-full my-2" />}
                <p className="text-lg font-bold text-[var(--semantic-brand-primary)]">{room.name}</p>
                <div className="flex flex-col gap-3 items-start w-full">
                  {room.items.map((item, index) => (
                    <div key={item.name} className="flex flex-col gap-2 items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-base font-semibold text-[var(--semantic-text-primary)]">
                          {item.name}
                        </p>
                        <span
                          className="h-7 px-3 flex items-center justify-center rounded-lg text-sm font-medium text-white"
                          style={{ backgroundColor: GLASS_PLASTIC_STATUS_COLORS[item.status] }}
                        >
                          {GLASS_PLASTIC_STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      {item.status !== "normal" && (
                        <div className="flex flex-col gap-2 items-start px-3 py-2 text-sm text-[var(--semantic-text-secondary)] bg-[#f9f9f9] rounded w-full">
                          <p>内容：{item.content}</p>
                          <p>原因：{item.cause}</p>
                          <p>
                            対応：{item.actionType}
                            {item.actionDetail && (
                              <>
                                <br />
                                {item.actionDetail}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                      {index < room.items.length - 1 && <div className="border-t border-[#e0e0e0] w-full" />}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-2 items-start w-full mb-4">
            <p className="text-base font-bold text-[var(--semantic-text-primary)]">実施情報</p>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--semantic-text-secondary)]">実施者</span>
                <span className="text-[var(--semantic-text-primary)]">{record?.implementer}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--semantic-text-secondary)]">確認者</span>
                <span className="text-[var(--semantic-text-primary)]">{record?.confirmer}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--semantic-text-secondary)]">フロア名</span>
                <span className="text-[var(--semantic-text-primary)]">{record?.floorName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-4 items-start w-full">
            <p className="text-base font-bold text-[var(--semantic-text-primary)]">コメント</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="点検内容に関する補足を入力できます（任意）"
              className="bg-[#f9f9f9] min-h-24 p-3 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)] border border-[#e0e0e0]"
            />
          </div>
          <button
            type="button"
            onClick={() => addComment(record?.id ?? "", comment)}
            className="mt-4 bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-full rounded-lg text-base font-semibold text-white"
          >
            コメントを残す
          </button>
        </div>
      </div>
    </div>
  );
}
