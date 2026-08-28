import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useWeightChecker } from "./WeightCheckerContext";

export function NewRegistrationPage() {
  const { factoryId, unitId } = useParams<{ factoryId: string; unitId?: string }>();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const { units, addUnit, updateUnit } = useWeightChecker();
  const navigate = useNavigate();

  const isEditing = Boolean(unitId);
  const existing = units.find((u) => u.id === unitId);

  const [name, setName] = useState(existing?.name ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("ウェイトチェッカー名は必須です");
      return;
    }
    const unit = { name: name.trim() };
    if (isEditing && unitId) {
      updateUnit(unitId, unit);
      navigate(`${basePath}/weight-checkers/${unitId}`, { state: { justUpdated: true } });
    } else {
      addUnit(unit);
      navigate(`${basePath}/weight-checkers/new/complete`);
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: `${basePath}` },
          { label: "ウェイトチェッカー管理", to: `${basePath}/weight-checkers` },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">ウェイトチェッカー名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例）ウェイトチェッカー1号機"
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() =>
              navigate(isEditing ? `${basePath}/weight-checkers/${unitId}` : `${basePath}/weight-checkers`)
            }
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
