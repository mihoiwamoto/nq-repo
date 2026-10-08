import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { Pulldown } from "../../components/Pulldown";
import { FACTORIES } from "../../../data/factories";
import { useProductManagement } from "./ProductManagementContext";
import { NQ_UNIT_OPTIONS } from "./types";

export function NqProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const isEditing = Boolean(productId);
  const { nqProducts, addNqProduct, updateNqProduct } = useProductManagement();
  const navigate = useNavigate();
  const existing = nqProducts.find((item) => item.id === productId);

  const [name, setName] = useState(existing?.name ?? "");
  const [quantity, setQuantity] = useState(existing?.quantity ?? "");
  const [quantityUnit, setQuantityUnit] = useState(existing?.quantityUnit ?? "");
  const [factoryId, setFactoryId] = useState(existing?.factoryId ?? "");
  const [expiry, setExpiry] = useState(existing?.expiry ?? "");
  // 本番と同じく項目ごとにエラーを出す。文言は本番の lang/ja/validation.php（製品名の属性名は「名前」）
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!name) next.name = "名前は必須です。";
    if (!factoryId) next.factoryId = "工場を入力してください。";
    if (!expiry) next.expiry = "賞味期限(日)は必須です。";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (isEditing && existing) {
      updateNqProduct(existing.id, { name, quantity, quantityUnit, factoryId, expiry });
      navigate(`/admin/products/nq/${existing.id}`, { state: { updated: true } });
    } else {
      addNqProduct({ name, quantity, quantityUnit, factoryId, expiry });
      navigate("/admin/products/nq/new/complete", { state: { productName: name } });
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "製品管理", to: "/admin/products?tab=nq" },
          ...(isEditing ? [{ label: "詳細", to: `/admin/products/nq/${productId}` }] : []),
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">製品名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例）ﾌﾟﾘﾝ 3種6個ｾｯﾄ 85g6入"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
            {errors.name && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">内容量</p>
              <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
            </div>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="例）40"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">内容量単位</p>
              <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
            </div>
            <Pulldown
              value={quantityUnit}
              onChange={setQuantityUnit}
              options={NQ_UNIT_OPTIONS.map((option) => ({ value: option, label: option }))}
              placeholder="未選択"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">工場名</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <Pulldown
              value={factoryId}
              onChange={setFactoryId}
              options={FACTORIES.map((factory) => ({ value: factory.id, label: factory.name }))}
              placeholder="選択してください"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
            {errors.factoryId && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.factoryId}</p>}
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">賞味期限</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="例）9999"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
            {errors.expiry && <p className="text-sm text-[var(--semantic-brand-danger)]">{errors.expiry}</p>}
          </div>
        </div>


        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `/admin/products/nq/${productId}` : "/admin/products?tab=nq")}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
