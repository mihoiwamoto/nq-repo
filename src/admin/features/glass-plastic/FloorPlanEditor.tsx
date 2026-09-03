import { useRef, useState, type MouseEvent } from "react";
import {
  MAP_ITEM_CATEGORY_LABELS,
  MAP_ITEM_CATEGORY_ORDER,
  type MapItem,
  type MapItemCategory,
} from "./types";
import { Toast } from "../../components/Toast";

function groupByRoom(items: MapItem[]) {
  const rooms: { room: string; items: MapItem[] }[] = [];
  for (const item of items) {
    let group = rooms.find((r) => r.room === item.room);
    if (!group) {
      group = { room: item.room, items: [] };
      rooms.push(group);
    }
    group.items.push(item);
  }
  return rooms;
}

export function FloorPlanEditor({
  imageUrl,
  items,
  onAddItem,
  onRemoveItem,
}: {
  imageUrl: string;
  items: MapItem[];
  onAddItem: (item: Omit<MapItem, "id">) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [armedCategory, setArmedCategory] = useState<MapItemCategory | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  const existingRooms = Array.from(new Set(items.map((i) => i.room)));

  function handleMapClick(e: MouseEvent<HTMLDivElement>) {
    if (!armedCategory || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPosition({ x, y });
  }

  function confirmAdd() {
    if (!armedCategory || !pendingPosition || !room.trim() || !name.trim()) return;
    onAddItem({
      room: room.trim(),
      name: name.trim(),
      category: armedCategory,
      x: pendingPosition.x,
      y: pendingPosition.y,
    });
    setPendingPosition(null);
    setName("");
  }

  function cancelAdd() {
    setPendingPosition(null);
  }

  function handleRemoveItem(itemId: string) {
    setToastMessage("削除されました。");
    setShowToast(true);
    onRemoveItem(itemId);
  }

  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <p className="text-sm text-[var(--semantic-text-secondary)]">
        左のアイテム種類を選び、配置図をクリックするとその場所にアイテムを配置できます。
      </p>
      <div className="flex gap-4 items-start w-full">
        <div className="flex flex-col gap-2 items-start shrink-0 w-[160px]">
          {MAP_ITEM_CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setArmedCategory((c) => (c === category ? null : category))}
              className={`h-10 w-full rounded-lg text-sm flex items-center px-3 ${
                armedCategory === category
                  ? "bg-[var(--semantic-brand-primary)] text-white"
                  : "bg-white border border-[#d0d0d0] text-[var(--semantic-text-primary)]"
              }`}
            >
              {MAP_ITEM_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        <div className="relative bg-[#d0d0d0] rounded-lg overflow-auto flex-1 h-[560px] flex items-center justify-center">
          <div
            ref={mapRef}
            onClick={handleMapClick}
            className="relative shrink-0"
            style={{ transform: `scale(${zoom})`, cursor: armedCategory ? "crosshair" : "default" }}
          >
            <img src={imageUrl} alt="配置図" className="block max-h-[540px]" />
            {items.map((item) => (
              <div
                key={item.id}
                title={`${item.room}／${item.name}`}
                className="absolute bg-[var(--semantic-brand-primary)] rounded-[3px] flex items-center justify-center size-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              />
            ))}
          </div>
          <div className="absolute right-4 top-[55%] -translate-y-1/2 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_3px_rgba(51,51,51,0.24)]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="bg-white w-10 h-10 flex items-center justify-center text-xl text-[#3ba55c] border-b border-[#d0d0d0]"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}
              className="bg-white w-10 h-10 flex items-center justify-center text-xl text-[#3ba55c]"
            >
              −
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-start shrink-0 w-[240px] bg-[#f1efea] rounded-lg p-4 h-[560px] overflow-y-auto">
          <p className="text-sm text-[var(--semantic-text-primary)]">並び順</p>
          {groupByRoom(items).length === 0 ? (
            <p className="text-sm text-[var(--semantic-text-secondary)]">まだ配置されていません</p>
          ) : (
            groupByRoom(items).map((group) => (
              <div key={group.room} className="flex flex-col gap-1 items-start w-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">{group.room}</p>
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between w-full pl-2">
                    <span className="text-sm text-[var(--semantic-text-primary)]">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-xs text-[var(--semantic-brand-danger)]"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {pendingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelAdd} />
          <div className="relative bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-4 p-6 w-[360px]">
            <p className="text-lg text-[var(--semantic-text-primary)]">
              {armedCategory && MAP_ITEM_CATEGORY_LABELS[armedCategory]}を配置
            </p>
            <div className="flex flex-col gap-1 items-start">
              <p className="text-sm text-[var(--semantic-text-primary)]">部屋名</p>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                list="existing-rooms"
                placeholder="例）出入口"
                className="bg-white border border-[#d0d0d0] h-10 px-3 rounded-lg text-sm text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
              <datalist id="existing-rooms">
                {existingRooms.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <p className="text-sm text-[var(--semantic-text-primary)]">アイテム名</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例）窓ガラス1"
                className="bg-white border border-[#d0d0d0] h-10 px-3 rounded-lg text-sm text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
            <div className="flex gap-2 items-center justify-end">
              <button
                type="button"
                onClick={cancelAdd}
                className="h-10 px-4 rounded-lg text-sm text-[var(--semantic-text-primary)] bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmAdd}
                disabled={!room.trim() || !name.trim()}
                className="h-10 px-4 rounded-lg text-sm text-white bg-[var(--semantic-brand-primary)] disabled:opacity-50"
              >
                配置
              </button>
            </div>
          </div>
        </div>
      )}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
