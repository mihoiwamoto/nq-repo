import { useRef, useState, type MouseEvent } from "react";
import {
  MAP_ITEM_CATEGORY_LABELS,
  MAP_ITEM_CATEGORY_ORDER,
  type MapItem,
  type MapItemCategory,
} from "./types";
import { Toast } from "../../components/Toast";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

/*
 * 配置レイアウト。本番（gp/area/create.blade.php・js/view/inspects/gp/area/add-item-view.js）に合わせた作り：
 * - 上の段に 選んでいる点検物（未選択）・「部屋」のプルダウンと「追加」（部屋一覧のポップアップ）・「名前」・ゴミ箱
 * - 左の一覧の見出しは「点検物」。点検物を選んで配置図を押すと、選んでいる部屋に置く（名前は 種類＋番号）
 * - 部屋を選んでいないと「部屋を先に選択、または追加してください。」
 * - 点検物の削除は確認のポップアップのあと「削除が完了しました」
 * 本番は点検物をドラッグで置くが、ここでは押して置く。
 */

function groupByRoom(items: MapItem[], rooms: string[]) {
  const groups: { room: string; items: MapItem[] }[] = rooms.map((room) => ({ room, items: [] }));
  for (const item of items) {
    let group = groups.find((r) => r.room === item.room);
    if (!group) {
      group = { room: item.room, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups.filter((g) => g.items.length > 0);
}

const MODAL_BOX =
  "relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]";
const BTN_CANCEL =
  "bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]";
const BTN_DANGER =
  "bg-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white";

function ConfirmDelete({
  title,
  onCancel,
  onDelete,
}: {
  title: string;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className={MODAL_BOX}>
        <div className="flex flex-col gap-6 items-start w-full">
          <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">{title}</h2>
          <p className="text-base text-[var(--semantic-text-primary)]">
            削除した情報は元に戻せません。削除しますか？
          </p>
        </div>
        <div className="flex gap-6 items-center justify-center w-full">
          <button type="button" onClick={onCancel} className={BTN_CANCEL}>
            キャンセル
          </button>
          <button type="button" onClick={onDelete} className={BTN_DANGER}>
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

export function FloorPlanEditor({
  imageUrl,
  items,
  onItemsChange,
  rooms,
  onRoomsChange,
  roomsOpen,
  onRoomsOpenChange,
}: {
  imageUrl: string;
  items: MapItem[];
  onItemsChange: (items: MapItem[]) => void;
  rooms: string[];
  onRoomsChange: (rooms: string[]) => void;
  /** 部屋一覧のポップアップ（登録のときの「部屋を追加」からも開くので親が持つ） */
  roomsOpen: boolean;
  onRoomsOpenChange: (open: boolean) => void;
}) {
  const [armedCategory, setArmedCategory] = useState<MapItemCategory | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [room, setRoom] = useState(rooms[0] ?? "");
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  // 本番は toastr.error。共通の Toast に赤が無いので、上の段の下に赤字で出す
  const [placeError, setPlaceError] = useState("");
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const currentRoom = rooms.includes(room) ? room : "";

  function handleMapClick(e: MouseEvent<HTMLDivElement>) {
    if (!armedCategory || !mapRef.current) return;
    if (!currentRoom) {
      setPlaceError("部屋を先に選択、または追加してください。");
      return;
    }
    setPlaceError("");
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const seq = items.filter((i) => i.category === armedCategory).length + 1;
    const id = `map-${Date.now()}-${items.length}`;
    onItemsChange([
      ...items,
      {
        id,
        room: currentRoom,
        name: `${MAP_ITEM_CATEGORY_LABELS[armedCategory]}${seq}`,
        category: armedCategory,
        x,
        y,
      },
    ]);
    setSelectedId(id);
  }

  function handleDeleteItem() {
    if (!selected) return;
    onItemsChange(items.filter((i) => i.id !== selected.id));
    setSelectedId(null);
    setDeleteItemOpen(false);
    setToast("削除が完了しました");
  }

  function addRoom() {
    const name = roomInput.trim();
    if (!name || rooms.includes(name)) return;
    onRoomsChange([...rooms, name]);
    if (!currentRoom) setRoom(name);
    setRoomInput("");
  }

  function saveRoom() {
    const name = roomInput.trim();
    if (!editingRoom || !name) return;
    onRoomsChange(rooms.map((r) => (r === editingRoom ? name : r)));
    onItemsChange(items.map((i) => (i.room === editingRoom ? { ...i, room: name } : i)));
    if (room === editingRoom) setRoom(name);
    setEditingRoom(null);
    setRoomInput("");
  }

  function removeRoom() {
    if (!deleteRoom) return;
    onRoomsChange(rooms.filter((r) => r !== deleteRoom));
    onItemsChange(items.filter((i) => i.room !== deleteRoom));
    if (room === deleteRoom) setRoom("");
    setDeleteRoom(null);
  }

  return (
    <div className="flex flex-col gap-2 items-start w-full">
      {/* 上の段：選んでいる点検物・部屋・名前・削除 */}
      <div className="bg-white flex gap-8 items-center px-4 py-3 rounded-lg w-full">
        <p className="text-base text-[var(--semantic-text-primary)] w-[160px] shrink-0">
          {armedCategory ? MAP_ITEM_CATEGORY_LABELS[armedCategory] : "未選択"}
        </p>
        <div className="flex gap-2 items-center">
          <p className="text-base text-[var(--semantic-text-primary)]">部屋</p>
          <select
            value={currentRoom}
            onChange={(e) => {
              setRoom(e.target.value);
              setPlaceError("");
            }}
            className="bg-white border border-[#d0d0d0] h-10 px-3 rounded-lg text-sm text-[var(--semantic-text-primary)] min-w-[160px]"
          >
            {rooms.length === 0 && <option value="" />}
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRoomsOpenChange(true)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)]"
          >
            + 追加
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <p className="text-base text-[var(--semantic-text-primary)]">名前</p>
          <input
            type="text"
            readOnly
            value={selected?.name ?? ""}
            className="bg-[#f6f6f6] border border-[#d0d0d0] h-10 px-3 rounded-lg text-sm text-[var(--semantic-text-primary)] w-[200px]"
          />
        </div>
        <button
          type="button"
          onClick={() => selected && setDeleteItemOpen(true)}
          disabled={!selected}
          className="ml-auto bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center disabled:opacity-50"
        >
          <img src={iconTrash} alt="削除" className="size-6" />
        </button>
      </div>

      {placeError && <p className="text-sm text-[var(--semantic-brand-danger)]">{placeError}</p>}
      <div className="flex gap-4 items-start w-full">
        <div className="flex flex-col gap-2 items-start shrink-0 w-[160px]">
          <p className="text-sm text-[var(--semantic-text-primary)]">点検物</p>
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

        <div className="flex flex-col gap-2 items-start flex-1">
          <p className="text-sm text-[var(--semantic-text-primary)]">配置レイアウト</p>
          <div className="relative bg-[#d0d0d0] rounded-lg overflow-auto w-full h-[560px] flex items-center justify-center">
            <div
              ref={mapRef}
              onClick={handleMapClick}
              className="relative shrink-0"
              style={{ transform: `scale(${zoom})`, cursor: armedCategory ? "crosshair" : "default" }}
            >
              <img src={imageUrl} alt="配置図" className="block max-h-[540px]" />
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.room}／${item.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                  }}
                  className={`absolute bg-[var(--semantic-brand-primary)] rounded-[3px] flex items-center justify-center size-4 -translate-x-1/2 -translate-y-1/2 ${
                    item.id === selectedId ? "ring-2 ring-[var(--semantic-brand-danger)]" : ""
                  }`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                />
              ))}
            </div>
            <div className="absolute right-4 top-[55%] -translate-y-1/2 flex flex-col rounded-lg overflow-hidden shadow-[0px_2px_6px_rgba(51,51,51,0.24)]">
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
        </div>

        <div className="flex flex-col gap-3 items-start shrink-0 w-[240px] bg-[#f1efea] rounded-lg p-4 h-[588px] overflow-y-auto">
          <p className="text-sm text-[var(--semantic-text-primary)]">並び順</p>
          {groupByRoom(items, rooms).length === 0 ? (
            <p className="text-sm text-[var(--semantic-text-secondary)]">データがありません。</p>
          ) : (
            groupByRoom(items, rooms).map((group) => (
              <div key={group.room} className="flex flex-col gap-1 items-start w-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">{group.room}</p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full pl-2 text-left text-sm ${
                      item.id === selectedId
                        ? "text-[var(--semantic-brand-primary)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 部屋一覧（本番 layouts/admin/modal/room.blade.php） */}
      {roomsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className={MODAL_BOX}>
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">部屋一覧</h2>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-3 items-center w-full">
                <input
                  type="text"
                  value={roomInput}
                  maxLength={64}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="部屋名を入力"
                  className="bg-white border border-[#d0d0d0] h-10 px-3 rounded-lg text-sm text-[var(--semantic-text-primary)] flex-1 placeholder:text-[var(--semantic-text-secondary)]"
                />
                {editingRoom ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoom(null);
                        setRoomInput("");
                      }}
                      className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 px-4 rounded-lg text-sm text-[var(--semantic-text-primary)]"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={saveRoom}
                      disabled={!roomInput.trim()}
                      className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 px-4 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                      保存
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={addRoom}
                    disabled={!roomInput.trim()}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)] disabled:opacity-50"
                  >
                    追加
                  </button>
                )}
              </div>
              <ul className="flex flex-col bg-white rounded-lg max-h-[240px] overflow-y-auto">
                {rooms.map((r) => (
                  <li key={r} className="flex items-center gap-2 px-4 h-12 border-b border-[#d0d0d0] last:border-b-0">
                    <span className="flex-1 text-base text-[var(--semantic-text-primary)]">{r}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoom(r);
                        setRoomInput(r);
                      }}
                      className="text-sm text-[var(--semantic-brand-primary)]"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteRoom(r)}
                      className="text-sm text-[var(--semantic-brand-danger)]"
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRoom(null);
                setRoomInput("");
                onRoomsOpenChange(false);
              }}
              className={BTN_CANCEL}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {deleteRoom && (
        <ConfirmDelete title={`${deleteRoom}を削除`} onCancel={() => setDeleteRoom(null)} onDelete={removeRoom} />
      )}
      {deleteItemOpen && selected && (
        <ConfirmDelete
          title={`${selected.name}を削除`}
          onCancel={() => setDeleteItemOpen(false)}
          onDelete={handleDeleteItem}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
