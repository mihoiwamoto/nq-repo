import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSensoryInspection } from "./SensoryInspectionContext";
import { CORE_SYSTEM_PRODUCT_NAMES } from "./mockData";
import { CRITERIA, type Criterion } from "./types";

function RecordToggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex gap-4 items-center">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`h-12 w-[200px] rounded-lg shadow-[0px_2px_2px_rgba(51,51,51,0.24)] text-base bg-white ${
          !value
            ? "border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
            : "border border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
        }`}
      >
        記録しない
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`h-12 w-[200px] rounded-lg shadow-[0px_2px_2px_rgba(51,51,51,0.24)] text-base bg-white ${
          value
            ? "border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
            : "border border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
        }`}
      >
        記録する
      </button>
    </div>
  );
}

export function NewRegistrationPage() {
  const { factoryId, productId } = useParams<{ factoryId: string; productId?: string }>();
  const { products, addProduct, updateProduct } = useSensoryInspection();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/sensory-inspection/factories/${factoryId}`;

  const isEditing = Boolean(productId);
  const existing = products.find((p) => p.id === productId);

  const [name, setName] = useState(existing?.name ?? "");
  const [criteria, setCriteria] = useState<Record<Criterion, boolean>>(
    existing?.criteria ?? { 味: false, 形: false, 色: false, 食感: false, 香り: false, とろみ: false }
  );
  const [error, setError] = useState("");
  const [pulldownOpen, setPulldownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nqRepoNames = products.map((product) => product.name);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPulldownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function selectName(value: string) {
    setName(value);
    setPulldownOpen(false);
  }

  function setCriterion(criterion: Criterion, value: boolean) {
    setCriteria((prev) => ({ ...prev, [criterion]: value }));
  }

  function handleSubmit() {
    if (!name) {
      setError("検査製品名は必須です");
      return;
    }
    if (isEditing && productId) {
      updateProduct(productId, { name, criteria });
      navigate(`${basePath}/products/${productId}`, { state: { justUpdated: true } });
    } else {
      addProduct({ name, criteria });
      navigate(`${basePath}/products/new/complete`);
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/sensory-inspection" },
          { label: "検査製品選択", to: basePath },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div ref={containerRef} className="relative flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">検査製品名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setPulldownOpen(true)}
            placeholder="例）マンゴープリン　ストレート　1kg"
            className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
          />

          {pulldownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg p-2 w-full z-10">
              {nqRepoNames.length > 0 && (
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-center py-2 w-full">
                    <p className="flex-1 text-base text-[var(--semantic-brand-primary)]">NQリポ</p>
                  </div>
                  {nqRepoNames.map((productName) => (
                    <button
                      key={productName}
                      type="button"
                      onClick={() => selectName(productName)}
                      className="flex h-[42px] items-center px-4 rounded-lg w-full text-left text-base text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-brand-primary)] hover:text-white"
                    >
                      {productName}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center justify-center py-2 w-full">
                  <p className="flex-1 text-base text-[var(--semantic-brand-primary)]">基幹システム</p>
                </div>
                {CORE_SYSTEM_PRODUCT_NAMES.map((productName) => (
                  <button
                    key={productName}
                    type="button"
                    onClick={() => selectName(productName)}
                    className="flex h-[42px] items-center px-4 rounded-lg w-full text-left text-base text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-brand-primary)] hover:text-white"
                  >
                    {productName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {CRITERIA.map((criterion) => (
          <div key={criterion} className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">{criterion}</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <RecordToggle
              value={criteria[criterion]}
              onChange={(value) => setCriterion(criterion, value)}
            />
          </div>
        ))}

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `${basePath}/products/${productId}` : basePath)}
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
