import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useScaleInspection } from "./ScaleInspectionContext";
import { getFactoryName } from "../../../data/factories";

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}): ReactNode {
  return (
    <div className="flex flex-col gap-1 items-start w-[416px]">
      <div className="flex gap-2 items-center">
        <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
        <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
      </div>
      <div className="flex gap-4 items-center w-full">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 h-12 rounded-lg text-base shadow-[0px_2px_2px_rgba(51,51,51,0.24)] bg-white ${
            !value ? "text-[var(--semantic-text-secondary)]" : "text-[var(--semantic-text-secondary)] opacity-60"
          }`}
        >
          記録しない
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 h-12 rounded-lg text-base shadow-[0px_2px_2px_rgba(51,51,51,0.24)] bg-white ${
            value
              ? "border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
              : "text-[var(--semantic-text-secondary)] opacity-60"
          }`}
        >
          記録する
        </button>
      </div>
    </div>
  );
}

export function ScaleManagementFormPage() {
  const { factoryId, scaleId } = useParams<{ factoryId: string; scaleId: string }>();
  const isEditing = Boolean(scaleId);
  const { scales, addScale, updateScale } = useScaleInspection();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const existing = scales.find((s) => s.id === scaleId);

  const [label, setLabel] = useState(existing?.label ?? "");
  const [serialNumber, setSerialNumber] = useState(existing?.serialNumber ?? "");
  const [weightCapacity, setWeightCapacity] = useState(existing ? String(existing.weightCapacity) : "");
  const [recordOperationCheck, setRecordOperationCheck] = useState(existing?.recordOperationCheck ?? true);
  const [recordLevelCheck, setRecordLevelCheck] = useState(existing?.recordLevelCheck ?? true);
  const [recordDirtCheck, setRecordDirtCheck] = useState(existing?.recordDirtCheck ?? true);
  const [recordDisplayValue, setRecordDisplayValue] = useState(existing?.recordDisplayValue ?? true);
  const [referenceWeight, setReferenceWeight] = useState(existing ? String(existing.referenceWeight) : "");
  const [minDisplayUnit, setMinDisplayUnit] = useState(existing ? String(existing.minDisplayUnit) : "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (
      !label.trim() ||
      !serialNumber.trim() ||
      !weightCapacity.trim() ||
      !referenceWeight.trim() ||
      !minDisplayUnit.trim()
    ) {
      setError("必須項目を入力してください");
      return;
    }
    const input = {
      factoryId: factoryId!,
      postId: existing?.postId ?? "",
      label,
      serialNumber,
      weightCapacity: Number(weightCapacity),
      recordOperationCheck,
      recordLevelCheck,
      recordDirtCheck,
      recordDisplayValue,
      referenceWeight: Number(referenceWeight),
      minDisplayUnit: Number(minDisplayUnit),
      repairStatus: existing?.repairStatus ?? null,
      displayFrom: existing?.displayFrom,
      displayTo: existing?.displayTo,
    };
    if (isEditing && existing) {
      updateScale(existing.id, input);
      navigate(`${basePath}/scale-management/${existing.id}`, { state: { justSaved: true } });
    } else {
      addScale(input);
      navigate(`${basePath}/scale-management/new/complete`);
    }
  }

  return (
    <div>
      <PageTitleBar title="秤管理" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/scale-inspection" },
          { label: "秤点検記録設定", to: basePath },
          { label: "秤管理", to: `${basePath}/scale-management` },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-6 items-start">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例）プリン①"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">シリアルナンバー</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="例）ABC-12345678"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">秤量(kg)</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="number"
              value={weightCapacity}
              onChange={(e) => setWeightCapacity(e.target.value)}
              placeholder="例）3"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <ToggleField label="動作確認" value={recordOperationCheck} onChange={setRecordOperationCheck} />
          <ToggleField label="水平点検" value={recordLevelCheck} onChange={setRecordLevelCheck} />
          <ToggleField label="汚れ" value={recordDirtCheck} onChange={setRecordDirtCheck} />
          <ToggleField label="秤の表示値(g)" value={recordDisplayValue} onChange={setRecordDisplayValue} />

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">使用分銅(g)</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="number"
              value={referenceWeight}
              onChange={(e) => setReferenceWeight(e.target.value)}
              placeholder="例）100"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">最小表示単位(g)</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={minDisplayUnit}
              onChange={(e) => setMinDisplayUnit(e.target.value)}
              placeholder="例）0.1"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
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
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
