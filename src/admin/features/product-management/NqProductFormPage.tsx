import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
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
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name || !factoryId || !expiry) {
      setError("製品名、工場名、賞味期限は必須です");
      return;
    }
    if (isEditing && existing) {
      updateNqProduct(existing.id, { name, quantity, quantityUnit, factoryId, expiry });
      navigate(`/admin/products/nq/${existing.id}`, { state: { justUpdated: true } });
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
              placeholder="例）プリン 3種6個セット 85g6入"
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
            />
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
              placeholder="例）㈱西通りプリン 本社工場"
              className="bg-white h-12 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-primary)]"
            />
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
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(isEditing ? `/admin/products/nq/${productId}` : "/admin/products?tab=nq")}
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
