import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PulldownSelect } from "../../components/PulldownSelect";
import { AppHeader } from "../../layout/AppHeader";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS, type StockCategory } from "./mockData";
import { formatAmount, parseAmount, unitOf, withUnit } from "../../utils/amount";

const STOCK_CATEGORIES: readonly StockCategory[] = ["入庫", "出庫"];

function computeAutoStock(initialStock: string, category: StockCategory | null, quantity: string) {
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

  const [category, setCategory] = useState<StockCategory | null>(existingRecord?.category ?? null);
  const [quantity, setQuantity] = useState(existingRecord?.quantity ?? "");
  const [currentStock, setCurrentStock] = useState(existingRecord?.currentStock ?? "");
  const [currentStockEdited, setCurrentStockEdited] = useState(false);
  const [remarks, setRemarks] = useState(existingRecord?.remarks ?? "");
  const basePath = `/app/ledger-list/additive-management/products/${productId}`;
  /** 数量・現在庫数は数値だけ入力してもらい、単位は品目の規格（例 1,000ml）から補う */
  const unit = unitOf(additive?.spec ?? "") || unitOf(additive?.initialStock ?? "");

  function applyCategory(next: StockCategory) {
    setCategory(next);
    if (!currentStockEdited) {
      const auto = computeAutoStock(additive?.initialStock ?? "", next, quantity);
      setCurrentStock(auto);
    }
  }

  function applyQuantity(next: string) {
    setQuantity(next);
    if (!currentStockEdited) {
      const auto = computeAutoStock(additive?.initialStock ?? "", category, next);
      setCurrentStock(auto);
    }
  }

  /** 手動修正したあとでも、押せば自動計算された値に戻せる */
  function handleAutoCalculate() {
    const auto = computeAutoStock(additive?.initialStock ?? "", category, quantity);
    setCurrentStock(auto);
    setCurrentStockEdited(false);
  }

  const canSave = category !== null && quantity.trim() !== "" && currentStock.trim() !== "";

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
        quantity: withUnit(quantity, unit),
        currentStock: withUnit(currentStock, unit),
        remarks,
        actor,
      },
    });
  }

  return (
    <>
      <AppHeader title={`添加物管理_${additive?.name ?? ""}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">保管場所</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {additive?.storageLocation ?? ""}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">規格</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{additive?.spec ?? ""}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">元在庫数</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {additive?.initialStock ?? ""}
                </p>
              </div>
            </div>

            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                区分 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <PulldownSelect
                value={category}
                onChange={applyCategory}
                options={STOCK_CATEGORIES}
                placeholder="選択をしてください"
              />
            </div>

            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                数量 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <input
                type="text"
                value={quantity}
                onChange={(e) => applyQuantity(e.target.value)}
                placeholder="例）1,000"
                className="bg-white h-12 px-4 rounded-lg text-base text-right text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>

            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-2 items-end justify-center w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  現在庫数 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex gap-2 items-center shrink-0">
                  <button
                    type="button"
                    onClick={handleAutoCalculate}
                    className="bg-white border border-[var(--semantic-brand-primary)] flex h-12 items-center justify-center px-2 rounded-lg text-base text-[var(--semantic-brand-primary)] shrink-0"
                  >
                    自動計算
                  </button>
                  <input
                    type="text"
                    value={currentStock}
                    onChange={(e) => {
                      setCurrentStock(e.target.value);
                      setCurrentStockEdited(true);
                    }}
                    placeholder="例）4,000"
                    className="bg-white h-12 px-4 rounded-lg text-base text-right text-[var(--semantic-text-primary)] w-[280px] placeholder:text-[var(--semantic-text-secondary)]"
                  />
                </div>
              </div>
              <p className="text-sm text-[var(--semantic-text-primary)] leading-relaxed">
                ※在庫数を修正した場合は、備考欄に理由を記載してください。
              </p>
            </div>

            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="例）月次定期発注による補充入庫"
                className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
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
