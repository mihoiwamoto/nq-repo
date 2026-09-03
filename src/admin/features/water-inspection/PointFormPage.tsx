import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useWaterInspection } from "./WaterInspectionContext";
import { getFactoryName } from "../../../data/factories";
import { WATER_INSPECTION_FORM_FIELDS, type WaterInspectionToggleKey } from "./types";

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1 items-start w-[416px]">
      <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
      <div className="flex gap-4 items-center w-full">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 h-12 rounded-lg text-base shadow-[0px_2px_2px_rgba(51,51,51,0.24)] ${
            !value
              ? "bg-white text-[var(--semantic-text-secondary)]"
              : "bg-white text-[var(--semantic-text-secondary)] opacity-60"
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

export function PointFormPage() {
  const { factoryId, pointId } = useParams<{ factoryId: string; pointId: string }>();
  const isEditing = Boolean(pointId);
  const { points, addPoint, updatePoint } = useWaterInspection();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/water-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);
  const existing = points.find((p) => p.id === pointId);

  const [name, setName] = useState(existing?.name ?? "");
  const [displayFrom, setDisplayFrom] = useState(existing?.displayFrom ?? "");
  const [displayTo, setDisplayTo] = useState(existing?.displayTo ?? "");
  const [checks, setChecks] = useState<Record<WaterInspectionToggleKey, boolean>>(
    existing?.checks ?? {
      taste: false,
      smell: false,
      color: false,
      turbidity: false,
      foreignMatter: false,
      ph: false,
      chlorine: false,
      uvOperatingHours: false,
      uvIndicatorLight: false,
      abnormalDetectionLight: false,
    }
  );
  const [uvAlertHours, setUvAlertHours] = useState(existing?.uvAlertHours ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name) {
      setError("点検場所は必須です");
      return;
    }
    const input = {
      factoryId: factoryId!,
      name,
      displayFrom: displayFrom || undefined,
      displayTo: displayTo || undefined,
      checks,
      uvAlertHours,
    };
    if (isEditing && existing) {
      updatePoint(existing.id, input);
      navigate(`${basePath}/points/${existing.id}`, { state: { justSaved: true } });
    } else {
      const created = addPoint(input);
      navigate(`${basePath}/points/${created.id}`);
    }
  }

  return (
    <div>
      <PageTitleBar title="使用水の点検" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/water-inspection" },
          { label: "点検場所選択", to: basePath },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-6 items-start">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <p className="text-xl text-[var(--semantic-text-primary)]">点検場所</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）給湯室"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <p className="text-xl text-[var(--semantic-text-primary)]">アプリ表示期間</p>
            <p className="text-sm text-[#808080]">
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

          {WATER_INSPECTION_FORM_FIELDS.map((field) =>
            field.type === "toggle" ? (
              <ToggleField
                key={field.key}
                label={field.label}
                value={checks[field.key]}
                onChange={(value) => setChecks((prev) => ({ ...prev, [field.key]: value }))}
              />
            ) : (
              <div key={field.key} className="flex flex-col gap-1 items-start w-[480px]">
                <p className="text-xl text-[var(--semantic-text-primary)]">{field.label}</p>
                <input
                  type="text"
                  value={uvAlertHours}
                  onChange={(e) => setUvAlertHours(e.target.value)}
                  placeholder="例）4,000"
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
                />
              </div>
            )
          )}
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
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
