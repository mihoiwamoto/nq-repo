import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { FACTORIES } from "../../../data/factories";
import { useStorageManagement } from "./StorageManagementContext";

export function StorageFormPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const isEditing = Boolean(locationId);
  const { storageLocations, addStorageLocation, updateStorageLocation } = useStorageManagement();
  const navigate = useNavigate();
  const existing = storageLocations.find((item) => item.id === locationId);

  const [name, setName] = useState(existing?.name ?? "");
  const [factoryId, setFactoryId] = useState(existing?.factoryId ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name || !factoryId) {
      setError("保管場所と工場は必須です");
      return;
    }
    if (isEditing && existing) {
      updateStorageLocation(existing.id, { name, factoryId });
      navigate(`/admin/storage/${existing.id}`, { state: { justUpdated: true } });
    } else {
      addStorageLocation({ name, factoryId });
      navigate("/admin/storage/new/complete");
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "保管場所管理", to: "/admin/storage" },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">保管場所</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）小型物置"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">工場</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <Pulldown
              value={factoryId}
              onChange={setFactoryId}
              options={FACTORIES.map((factory) => ({ value: factory.id, label: factory.name }))}
              placeholder="工場を選択"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
