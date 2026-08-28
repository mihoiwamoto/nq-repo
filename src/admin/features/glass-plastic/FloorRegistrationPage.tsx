import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
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
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("配置図はPNGまたはJPEG（JPG）形式のみアップロード可能です");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("配置図のファイル容量は5MBまでです");
      return;
    }
    setError("");
    setPlanFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPlanImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("フロア名は必須です");
      return;
    }
    addFloor({
      id: `floor-${Date.now()}`,
      name: name.trim(),
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
      planImageUrl,
      mapItems,
      repairItems: [],
    });
    navigate(basePath);
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
            placeholder="例）フロアC"
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
            <input
              type="date"
              value={displayFrom}
              onChange={(e) => setDisplayFrom(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
            />
            <span className="text-[var(--semantic-text-primary)]">〜</span>
            <input
              type="date"
              value={displayTo}
              onChange={(e) => setDisplayTo(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
            />
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
            ※ファイル容量は5MBまでアップロード可能です。
            <br />
            ※推奨画像サイズは660×1096pxです。
          </p>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-brand-primary)]"
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
              onAddItem={(item) =>
                setMapItems((prev) => [...prev, { ...item, id: `map-${Date.now()}-${prev.length}` }])
              }
              onRemoveItem={(itemId) =>
                setMapItems((prev) => prev.filter((item) => item.id !== itemId))
              }
            />
          </div>
        )}

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  );
}
