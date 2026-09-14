import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { CONFIRM_STATUS_COLOR } from "../../components/ConfirmStatusBadge";
import { getFactoryName } from "../../../data/factories";
import floorMapImage from "../../../assets/figma/floorplans/floor-a.png";
import { useRecords } from "./RecordsContext";
import { GLASS_PLASTIC_STATUS_COLORS, GLASS_PLASTIC_STATUS_LABELS, type ConfirmStatus, type GlassPlasticItemStatus } from "./types";

const STATUS_OPTIONS: { value: ConfirmStatus; label: string }[] = [
  { value: "unconfirmed", label: "点検済み" },
  { value: "confirmed", label: "承認待ち" },
];

const FILTER_STATUS_ORDER: GlassPlasticItemStatus[] = ["normal", "issue", "repairing"];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setConfirmStatus, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const listPath = `/admin/confirmations/glass-plastic/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);
  const [activeFilters, setActiveFilters] = useState<GlassPlasticItemStatus[]>([]);
  const [mapScale, setMapScale] = useState(1);
  const [newComment, setNewComment] = useState("");

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

  function handleAddComment() {
    if (!record || !newComment.trim()) return;
    addComment(record.id, newComment.trim());
    setNewComment("");
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

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "確認管理", to: "/admin/confirmations" },
          { label: "工場選択", to: "/admin/confirmations/glass-plastic" },
          { label: "データ一覧", to: listPath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <Pulldown
            value={record.confirmStatus}
            onChange={(value) => setConfirmStatus(record.id, value as ConfirmStatus)}
            options={STATUS_OPTIONS}
            className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
            style={{ backgroundColor: CONFIRM_STATUS_COLOR[record.confirmStatus] }}
          />
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">フロア名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.floorName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
        </div>

        <div className="relative bg-white border-2 border-[var(--semantic-brand-primary)] rounded-lg h-[500px] flex items-center justify-center overflow-hidden w-full shadow-md">
          <img
            src={floorMapImage}
            alt={`${record.floorName}の配置図`}
            style={{ transform: `scale(${mapScale})` }}
            className="h-full w-full object-contain transition-transform"
          />
          <div className="absolute right-4 bottom-4 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
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

        <div className="flex gap-2 items-center">
          <p className="text-sm font-semibold text-[var(--semantic-brand-primary)]">絞り込み：</p>
          <div className="flex gap-4 items-center">
            {FILTER_STATUS_ORDER.map((status) => {
              const active = activeFilters.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleFilter(status)}
                  className="h-7 w-[88px] rounded-lg text-base font-semibold transition-colors"
                  style={
                    active
                      ? { backgroundColor: GLASS_PLASTIC_STATUS_COLORS[status], color: "white" }
                      : { border: "1px solid #808080", color: "#808080" }
                  }
                >
                  {GLASS_PLASTIC_STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          {visibleRooms.length === 0 ? (
            <p className="text-base text-[var(--semantic-text-secondary)]">該当する点検箇所がありません</p>
          ) : (
            visibleRooms.map((room, roomIndex) => (
              <div key={room.id} className="flex flex-col gap-4 items-start w-full">
                {roomIndex > 0 && <div className="border-t border-[#d0d0d0] w-full my-2" />}
                <p className="text-2xl font-bold text-[var(--semantic-brand-primary)]">{room.name}</p>
                <div className="flex flex-col gap-3 items-start w-full">
                  {room.items.map((item, index) => (
                    <div key={item.name} className="flex flex-col gap-2 items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-xl text-[var(--semantic-text-primary)]">{item.name}</p>
                        <span
                          className="h-7 w-[88px] flex items-center justify-center rounded-lg text-base text-white"
                          style={{ backgroundColor: GLASS_PLASTIC_STATUS_COLORS[item.status] }}
                        >
                          {GLASS_PLASTIC_STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      {item.status !== "normal" && (
                        <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
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

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
          <div className="bg-white flex items-center justify-between gap-4 px-4 py-6 rounded-lg w-full">
            <p className="text-sm text-[var(--semantic-text-primary)]">
              修理状況は点検場所詳細画面にてご確認いただけます。
            </p>
            <Link
              to={`/admin/ledger-management/glass-plastic/factories/${factoryId}/floors/${record.floorId}`}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-40 rounded-lg flex items-center justify-center shrink-0 text-sm text-[var(--semantic-brand-primary)]"
            >
              点検場所詳細へ
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          <CommentInputBox value={newComment} onChange={setNewComment} onSubmit={handleAddComment} />
        </div>
      </div>
    </div>
  );
}
