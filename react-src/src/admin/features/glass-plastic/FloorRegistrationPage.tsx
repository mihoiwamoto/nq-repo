import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { DateFilterInput } from "../../components/DateFilterInput";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useGlassPlastic } from "./GlassPlasticContext";
import { FloorPlanEditor } from "./FloorPlanEditor";
import type { MapItem } from "./types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function FloorRegistrationPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const basePath = `/admin/ledger-management/glass-plastic/factories/${factoryId}`;
  const { addFloor } = useGlassPlastic();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [displayFrom, setDisplayFrom] = useState("");
  const [displayTo, setDisplayTo] = useState("");
  const [planImageUrl, setPlanImageUrl] = useState<string>();
  const [planFileName, setPlanFileName] = useState("");
  const [mapItems, setMapItems] = useState<MapItem[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomsOpen, setRoomsOpen] = useState(false);
  // 本番（gp/area/create.blade.php）の「登録」：部屋が無ければ「部屋が登録されていません」、あれば「配置図を確定しますか？」
  const [emptyRoomOpen, setEmptyRoomOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // 本番は形式違いのエラー文が無い（ファイルを選ぶ欄で PNG・JPEG に絞るだけ）
    if (!["image/png", "image/jpeg"].includes(file.type)) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルのサイズが5MBを超えています。再度取り込み直してください。");
      return;
    }
    setError("");
    setPlanFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPlanImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    // 本番（Gp/Area/StoreRequest）の入力チェックと文言
    if (!name.trim()) {
      setError("フロア名は必須です。");
      return;
    }
    if (displayFrom && displayTo && displayTo < displayFrom) {
      setError("アプリ表示終了日は開始日以降の日付で入力してください。");
      return;
    }
    if (!planImageUrl) {
      setError("配置図は必須です。");
      return;
    }
    setError("");
    if (rooms.length === 0) {
      setEmptyRoomOpen(true);
      return;
    }
    setConfirmOpen(true);
  }

  function submit() {
    setConfirmOpen(false);
    addFloor({
      id: `floor-${Date.now()}`,
      name: name.trim(),
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
      planImageUrl,
      mapItems,
      repairItems: [],
    });
    navigate(`${basePath}/floors/registered`);
  }

  return (
    <div>
      <PageTitleBar title="新規登録" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/glass-plastic" },
          { label: "点検場所選択", to: basePath },
          { label: "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">フロア名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例）本社工場 1階"
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">アプリ表示期間</p>
            <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            日付指定が無い場合は、常にアプリ上に表示されます。
          </p>
          <div className="flex gap-2 items-center">
            <DateFilterInput value={displayFrom} onChange={setDisplayFrom} />
            <span className="text-[var(--semantic-text-primary)]">〜</span>
            <DateFilterInput value={displayTo} onChange={setDisplayTo} />
          </div>
        </div>

        <div className="flex flex-col gap-1 items-start w-[603px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">配置図</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            ※アップロード可能なファイル形式は「PNG」または「JPEG（JPG）」形式のみとなります。
            <br />
            ※ファイルのサイズは5MBまでアップロード可能です。
            <br />
            ※画像サイズは660 × 1096で設定ください。
          </p>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              ファイルを選択
            </button>
            {planFileName && (
              <span className="text-sm text-[var(--semantic-text-primary)]">{planFileName}</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {planImageUrl && (
          <div className="flex flex-col gap-1 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">配置レイアウト</p>
            <FloorPlanEditor
              imageUrl={planImageUrl}
              items={mapItems}
              onItemsChange={setMapItems}
              rooms={rooms}
              onRoomsChange={setRooms}
              roomsOpen={roomsOpen}
              onRoomsOpenChange={setRoomsOpen}
            />
          </div>
        )}

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            登録
          </button>
        </div>
      </div>

      {emptyRoomOpen && (
        <ConfirmDialog
          title="部屋が登録されていません"
          body="操作を続けるには、少なくとも1つ以上の部屋を登録してください。"
          okLabel="部屋を追加"
          okClass="bg-[var(--semantic-brand-danger)]"
          onCancel={() => setEmptyRoomOpen(false)}
          onOk={() => {
            setEmptyRoomOpen(false);
            setRoomsOpen(true);
          }}
        />
      )}
      {confirmOpen && (
        <ConfirmDialog
          title="配置図を確定しますか？"
          body="現在の配置図を確定すると、登録完了後は修正や変更ができません。確定前に内容をよくご確認ください。"
          okLabel="登録"
          okClass="bg-[var(--semantic-brand-primary)]"
          onCancel={() => setConfirmOpen(false)}
          onOk={submit}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  okLabel,
  okClass,
  onCancel,
  onOk,
}: {
  title: string;
  body: string;
  okLabel: string;
  okClass: string;
  onCancel: () => void;
  onOk: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
        <div className="flex flex-col gap-6 items-start w-full">
          <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">{title}</h2>
          <p className="text-base text-[var(--semantic-text-primary)]">{body}</p>
        </div>
        <div className="flex gap-6 items-center justify-center w-full">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onOk}
            className={`${okClass} shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white`}
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
