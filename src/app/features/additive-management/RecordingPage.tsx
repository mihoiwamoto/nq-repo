import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS, type StockCategory } from "./mockData";

function parseAmount(value: string): { amount: number; unit: string } {
  const match = value.match(/^([\d,]+)(.*)$/);
  if (!match) return { amount: NaN, unit: "" };
  return { amount: Number(match[1].replace(/,/g, "")), unit: match[2] };
}

function formatAmount(amount: number, unit: string) {
  return `${amount.toLocaleString("ja-JP")}${unit}`;
}

function computeAutoStock(initialStock: string, category: StockCategory | "", quantity: string) {
  if (!category || !quantity.trim()) return "";
  const base = parseAmount(initialStock);
  const qty = parseAmount(quantity);
  if (Number.isNaN(base.amount) || Number.isNaN(qty.amount)) return "";
  const result = category === "入庫" ? base.amount + qty.amount : base.amount - qty.amount;
  return formatAmount(result, base.unit);
}

export function RecordingPage() {
  const { productId, recordId } = useParams<{ productId: string; recordId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { additives, records } = useAdditiveManagement();

  const additive = additives.find((a) => a.id === productId);
  const existingRecord = recordId ? records.find((r) => r.id === recordId) : undefined;

  const state = location.state as { date?: string; inspectorName?: string } | null;
  const date = existingRecord?.date ?? state?.date ?? "2025/04/01";
  const actor = existingRecord?.actor ?? state?.inspectorName ?? ACTORS[0].name;

  const [category, setCategory] = useState<StockCategory | "">(existingRecord?.category ?? "");
  const [quantity, setQuantity] = useState(existingRecord?.quantity ?? "");
  const [currentStock, setCurrentStock] = useState(existingRecord?.currentStock ?? "");
  const [currentStockEdited, setCurrentStockEdited] = useState(false);
  const [remarks, setRemarks] = useState(existingRecord?.remarks ?? "");

  const basePath = `/app/ledger-list/additive-management/products/${productId}`;

  function applyCategory(next: StockCategory | "") {
    setCategory(next);
    if (!currentStockEdited) {
      setCurrentStock(computeAutoStock(additive?.initialStock ?? "", next, quantity));
    }
  }

  function applyQuantity(next: string) {
    setQuantity(next);
    if (!currentStockEdited) {
      setCurrentStock(computeAutoStock(additive?.initialStock ?? "", category, next));
    }
  }

  function handleAutoCalculate() {
    setCurrentStock(computeAutoStock(additive?.initialStock ?? "", category, quantity));
    setCurrentStockEdited(false);
  }

  const canSave = category !== "" && quantity.trim() !== "" && currentStock.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    navigate(`${basePath}/confirm`, {
      state: {
        productId,
        recordId: existingRecord?.id,
        date,
        storageLocation: additive?.storageLocation ?? "",
        spec: additive?.spec ?? "",
        initialStock: additive?.initialStock ?? "",
        category,
        quantity,
        currentStock,
        remarks,
        actor,
      },
    });
  }

  return (
    <>
      <AppHeader title={`添加物管理_${additive?.name ?? ""}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-5 items-center">
          <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">保管場所</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{additive?.storageLocation ?? ""}</p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">規格</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{additive?.spec ?? ""}</p>
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">元在庫数</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{additive?.initialStock ?? ""}</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] w-full max-w-full max-w-[480px] mx-40" />

          <div className="flex flex-col gap-5 items-start w-full max-w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                区分 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <select
                value={category}
                onChange={(e) => applyCategory(e.target.value as StockCategory)}
                className="bg-white h-12 px-4 rounded-lg text-base w-full text-[var(--semantic-text-primary)]"
              >
                <option value="" className="text-[#808080]">
                  選択をしてください
                </option>
                <option value="入庫">入庫</option>
                <option value="出庫">出庫</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={quantity}
                onChange={(e) => applyQuantity(e.target.value)}
                placeholder="例）1,000"
                className="bg-white h-12 px-4 rounded-lg text-base w-full text-[var(--semantic-text-primary)] placeholder:text-[#808080]"
              />
            </div>

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                現在庫数 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex gap-2 items-center w-full">
                <input
                  type="text"
                  value={currentStock}
                  onChange={(e) => {
                    setCurrentStock(e.target.value);
                    setCurrentStockEdited(true);
                  }}
                  placeholder="例）4,000"
                  className="bg-white h-12 px-4 rounded-lg text-base flex-1 text-[var(--semantic-text-primary)] placeholder:text-[#808080]"
                />
                <button
                  type="button"
                  onClick={handleAutoCalculate}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg text-base text-[var(--semantic-brand-primary)] shrink-0"
                >
                  自動計算
                </button>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)]">
                ※在庫数を修正した場合は、備考欄に理由を記載してください。
              </p>
            </div>

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="例）月次定期発注による補充入庫"
                className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[#808080]"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            一覧へ戻る
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
              canSave ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
            }`}
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}
