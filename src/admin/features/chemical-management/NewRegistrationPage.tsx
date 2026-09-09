import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { STORAGE_LOCATIONS } from "../../../data/storageLocations";

const UNIT_OPTIONS = ["g", "kg", "ml", "L", "%"];

export function NewRegistrationPage() {
  const { factoryId, chemicalId } = useParams<{ factoryId: string; chemicalId?: string }>();
  const isEditing = Boolean(chemicalId);
  const { chemicals, addChemical, updateChemical } = useChemicalManagement();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/chemical-management/factories/${factoryId}`;
  const storageLocationOptions = STORAGE_LOCATIONS.filter(
    (location) => location.factoryId === factoryId
  );
  const existing = chemicals.find((item) => item.id === chemicalId);

  const [name, setName] = useState(existing?.name ?? "");
  const [spec, setSpec] = useState(existing?.spec ?? "");
  const [unit, setUnit] = useState(existing?.unit ?? "");
  const [storageLocation, setStorageLocation] = useState(existing?.storageLocation ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name || !spec || !unit || !storageLocation) {
      setError("薬品名、規格、保管場所は必須です");
      return;
    }
    if (isEditing && existing) {
      updateChemical(existing.id, { name, spec, unit, storageLocation });
      navigate(`${basePath}/chemicals/${existing?.id}`, { state: { justSaved: true } });
    } else {
      addChemical({ name, spec, unit, storageLocation });
      navigate(`${basePath}/chemicals/registered`);
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/chemical-management" },
          { label: "薬品選択", to: basePath },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">薬品名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）次亜塩素酸ナトリウム"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-2 items-start">
            <div className="flex flex-col gap-1 items-start w-[480px]">
              <div className="flex gap-2 items-center">
                <p className="text-xl text-[var(--semantic-text-primary)]">規格</p>
                <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
              </div>
              <input
                type="text"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="例）1000"
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
              />
            </div>
            <Pulldown
              value={unit}
              onChange={setUnit}
              options={UNIT_OPTIONS.map((option) => ({ value: option, label: option }))}
              placeholder="例）g"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">保管場所</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <Pulldown
              value={storageLocation}
              onChange={setStorageLocation}
              options={storageLocationOptions.map((location) => ({ value: location.name, label: location.name }))}
              placeholder="例）小型物置"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `${basePath}/chemicals/${chemicalId}` : basePath)}
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
