import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PulldownSelect } from "../../components/PulldownSelect";
import { todayString } from "../../utils/date";
import { formatAmount, parseAmount, unitOf, withUnit } from "../../utils/amount";
import { AppHeader } from "../../layout/AppHeader";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { ACTORS, type StockCategory } from "./mockData";

const STOCK_CATEGORIES: readonly StockCategory[] = ["入庫", "出庫"];

/** 元在庫数に対して入庫なら足し、出庫なら引く。単位は元在庫数の表記から引き継ぐ */
function computeAutoStock(previousStock: string, category: StockCategory | null, quantity: string) {
  if (!category || !quantity.trim()) return "";
  const base = parseAmount(previousStock);
  const qty = parseAmount(quantity);
  if (Number.isNaN(base.amount) || Number.isNaN(qty.amount)) return "";
  const result = category === "入庫" ? base.amount + qty.amount : base.amount - qty.amount;
  return formatAmount(result, base.unit);
}

type EditRecord = { category: StockCategory | ""; quantity: string; currentStock: string; remarks: string };

/** 差し戻しの編集で開いたときは、記録の値（単位付き）から数値だけを入力欄に戻す */
const amountOnly = (v: string) => v.replace(/[^\d,.]/g, "");

export function ChemicalRecordingPage() {
  const { chemicalId } = useParams<{ chemicalId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { chemicals, addRecord, updateChemicalStatus } = useChemicalManagement();

  const chemical = chemicals.find((c) => c.id === chemicalId);
  const state = location.state as
    | {
        date?: string;
        inspectorName?: string;
        editRecord?: EditRecord;
        editReturn?: { to: string; state?: unknown };
        fromProgress?: boolean;
        progressStatus?: string;
        editing?: boolean;
      }
    | null;
  // 進捗一覧から来た一覧（点検中・点検済みの「編集」）へ戻るときは、進捗のステータスも一緒に戻す
  const progressCarry = state?.fromProgress
    ? { fromProgress: true, progressStatus: state.progressStatus, editing: state.editing }
    : {};
  // 確認待ちの差し戻しから「点検内容を修正する」で来たときの戻り先と、直す記録（2026-10-02）。
  // このときは記録を足さず、「編集を保存」で元の詳細画面に戻すだけにする
  const editReturn = state?.editReturn;
  const editRecord = state?.editRecord;
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;
  const date = state?.date ?? todayString();

  const [category, setCategory] = useState<StockCategory | null>(editRecord?.category || null);
  const [quantity, setQuantity] = useState(editRecord ? amountOnly(editRecord.quantity) : "");
  const [currentStock, setCurrentStock] = useState(
    editRecord ? amountOnly(editRecord.currentStock) : "",
  );
  const [currentStockEdited, setCurrentStockEdited] = useState(false);
  const [remarks, setRemarks] = useState(editRecord?.remarks ?? "");
  const basePath = `/app/ledger-list/chemical-management/${chemicalId}`;
  /** 数量・現在庫数は数値だけ入力してもらい、単位は品目の規格（例 1,000ml）から補う */
  const unit = unitOf(chemical?.spec ?? "") || unitOf(chemical?.currentQuantity ?? "");
  const previousStock = chemical?.currentQuantity ?? "";
  const canSave = category !== null && quantity.trim() !== "" && currentStock.trim() !== "";

  /** 現在庫数を手で直していないうちは、区分・数量に追従して自動で埋める */
  function applyCategory(next: StockCategory) {
    setCategory(next);
    if (!currentStockEdited) {
      const auto = computeAutoStock(previousStock, next, quantity);
      setCurrentStock(auto);
    }
  }

  function applyQuantity(next: string) {
    setQuantity(next);
    if (!currentStockEdited) {
      const auto = computeAutoStock(previousStock, category, next);
      setCurrentStock(auto);
    }
  }

  /** 手動修正したあとでも、押せば自動計算された値に戻せる */
  function handleAutoCalculate() {
    const auto = computeAutoStock(previousStock, category, quantity);
    setCurrentStock(auto);
    setCurrentStockEdited(false);
  }

  /** 保存すると記録一覧に戻る。提出は一覧の「確認画面へ」から行う */
  function handleSave() {
    if (!canSave) return;
    addRecord({
      chemicalId: chemicalId ?? "",
      date: date.replaceAll("-", "/"),
      managementNumber: chemical?.managementNumber ?? "",
      storageLocation: chemical?.storageLocation ?? "",
      category,
      previousStock,
      usedQuantity: withUnit(quantity, unit),
      currentStock: withUnit(currentStock, unit),
      purposeOfUse: "",
      remarks,
      actor: inspectorName,
    });
    if (chemical?.status === "not_inspected" && chemicalId) {
      updateChemicalStatus(chemicalId, "in_progress");
    }
    navigate(basePath, { state: { ...progressCarry, date, inspectorName } });
  }

  return (
    <>
      <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">保管場所</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {chemical?.storageLocation ?? ""}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">規格</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{chemical?.spec ?? ""}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">元在庫数</p>
                <p className="text-base text-[var(--semantic-text-primary)]">{previousStock}</p>
              </div>
            </div>

            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                区分 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <PulldownSelect value={category} onChange={applyCategory} options={STOCK_CATEGORIES} />
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

            {/* 確定デザイン 7139:245259：「自動計算」は 80×48 の白地・緑の枠、欄の下に右寄せで在庫数を直したときの注記 */}
            <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                現在庫数 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex gap-2 items-center shrink-0">
                <button
                  type="button"
                  onClick={handleAutoCalculate}
                  className="bg-white border border-[var(--semantic-brand-primary)] flex h-12 w-20 items-center justify-center px-0 whitespace-nowrap rounded-lg text-base font-bold text-[var(--semantic-brand-primary)] shrink-0"
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
            <p className="text-sm font-normal text-[var(--semantic-text-primary)] text-right">
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

        {editReturn ? (
          /* 差し戻しの編集モード。提出はせず、「編集を保存」で確認待ち詳細の元のステップに戻る（機械器具点検と同じ） */
          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => navigate(editReturn.to, { state: editReturn.state })}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => navigate(editReturn.to, { state: editReturn.state })}
              className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                canSave ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
              }`}
            >
              編集を保存
            </button>
          </div>
        ) : (
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate(basePath, { state: { ...progressCarry, date, inspectorName } })}
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
        )}
      </div>
    </>
  );
}
