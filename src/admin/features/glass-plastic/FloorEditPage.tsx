import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useGlassPlastic } from "./GlassPlasticContext";
import { FloorPlanPreview } from "./FloorPlanPreview";

export function FloorEditPage() {
  const { factoryId, floorId } = useParams<{ factoryId: string; floorId: string }>();
  const basePath = `/admin/ledger-management/glass-plastic/factories/${factoryId}`;
  const detailPath = `${basePath}/floors/${floorId}`;
  const { floors, updateFloor } = useGlassPlastic();
  const navigate = useNavigate();
  const floor = floors.find((f) => f.id === floorId);

  const [name, setName] = useState(floor?.name ?? "");
  const [displayFrom, setDisplayFrom] = useState(floor?.displayFrom ?? "");
  const [displayTo, setDisplayTo] = useState(floor?.displayTo ?? "");
  const [error, setError] = useState("");

  if (!floor) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">点検場所が見つかりません</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("フロア名は必須です");
      return;
    }
    updateFloor(floor!.id, {
      name: name.trim(),
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
    });
    navigate(detailPath);
  }

  return (
    <div>
      <PageTitleBar title="編集" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/glass-plastic" },
          { label: "点検場所選択", to: basePath },
          { label: "詳細", to: detailPath },
          { label: "編集" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-1 items-start w-[480px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">フロア名</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>

        <div className="flex flex-col gap-1 items-start">
          <p className="text-xl text-[var(--semantic-text-primary)]">アプリ表示期間</p>
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

        <div className="flex flex-col gap-1 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">配置図</p>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            配置図は編集画面では変更できません。変更をご希望の場合は新規登録より再度登録作業をしてください。
          </p>
          {floor.planImageUrl ? (
            <FloorPlanPreview
              imageUrl={floor.planImageUrl}
              items={floor.mapItems}
              alt={`${floor.name}の配置図`}
            />
          ) : (
            <p className="text-base text-[var(--semantic-text-secondary)]">未設定</p>
          )}
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(detailPath)}
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
