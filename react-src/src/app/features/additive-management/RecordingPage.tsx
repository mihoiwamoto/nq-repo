import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PulldownSelect } from "../../components/PulldownSelect";
import { AppHeader } from "../../layout/AppHeader";
import { useFromProgress } from "../../layout/ProgressFlowContext";
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

type EditRecord = { category: StockCategory | ""; quantity: string; currentStock: string; remarks: string };

/** 差し戻しの編集で開いたときは、記録の値（単位付き）から数値だけを入力欄に戻す */
const amountOnly = (v: string) => v.replace(/[^\d,.]/g, "");

export function RecordingPage() {
  const { productId, recordId } = useParams<{ productId: string; recordId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { additives, records, addRecord, updateRecord, updateAdditiveStatus } = useAdditiveManagement();

  const additive = additives.find((a) => a.id === productId);
  const existingRecord = recordId ? records.find((r) => r.id === recordId) : undefined;

  const state = location.state as
    | {
        date?: string;
        inspectorName?: string;
        editRecord?: EditRecord;
        editReturn?: { to: string; state?: unknown };
        addReturn?: { to: string; state?: unknown };
        fromProgress?: boolean;
        progressStatus?: string;
        /** 進捗一覧（点検中）の一覧の「詳細」から開いたときの、直す記録の id。保存で記録を足さずに書き換える */
        editRecordId?: string;
      }
    | null;
  // 確認待ちの差し戻しから「点検内容を修正する」で来たときの戻り先と、直す記録（2026-10-02）
  const editReturn = state?.editReturn;
  const editRecord = state?.editRecord;
  // 確認待ちの一覧から「＋記録を追加」で来たときの戻り先（確定デザイン 7139:233626。2026-10-06）。「一覧へ戻る」「保存」で確認待ちへ戻る
  const addReturn = state?.addReturn;
  // 進捗一覧から開いた一覧（点検中）から来たとき（確定デザイン「進捗一覧_添加物管理表_記録画面」7139:238432）。
  // 「保存」は確認画面へ進まず、記録を一覧に足して（「詳細」から来たときはその記録を書き換えて）一覧へ戻る（7139:238230）。
  // 「一覧へ戻る」も進捗のステータスを持ったまま一覧へ戻す（2026-10-07）
  const fromProgressFlow = useFromProgress();
  const progressList = fromProgressFlow && !!state?.fromProgress && !editReturn && !addReturn;
  const progressListState = progressList
    ? { fromProgress: true, progressStatus: state?.progressStatus, date: state?.date, inspectorName: state?.inspectorName }
    : undefined;
  const progressEditTarget =
    progressList && state?.editRecordId ? records.find((r) => r.id === state.editRecordId) : undefined;
  const date = existingRecord?.date ?? state?.date ?? "2025/04/01";
  const actor = existingRecord?.actor ?? state?.inspectorName ?? ACTORS[0].name;

  const [category, setCategory] = useState<StockCategory | null>(
    existingRecord?.category ?? (editRecord?.category || null),
  );
  const [quantity, setQuantity] = useState(
    existingRecord?.quantity ?? (editRecord ? amountOnly(editRecord.quantity) : ""),
  );
  const [currentStock, setCurrentStock] = useState(
    existingRecord?.currentStock ?? (editRecord ? amountOnly(editRecord.currentStock) : ""),
  );
  const [currentStockEdited, setCurrentStockEdited] = useState(false);
  const [remarks, setRemarks] = useState(existingRecord?.remarks ?? editRecord?.remarks ?? "");
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
    if (progressList && category) {
      const input = {
        additiveId: productId ?? "",
        date: progressEditTarget?.date ?? date.replaceAll("-", "/"),
        storageLocation: progressEditTarget?.storageLocation ?? additive?.storageLocation ?? "",
        category,
        quantity: withUnit(quantity, unit),
        currentStock: withUnit(currentStock, unit),
        remarks,
        actor: progressEditTarget?.actor ?? actor,
      };
      if (progressEditTarget) updateRecord(progressEditTarget.id, input);
      else addRecord(input);
      if (additive?.status === "not_inspected" && productId) updateAdditiveStatus(productId, "in_progress");
      navigate(basePath, { state: progressListState });
      return;
    }
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
                <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">保管場所</p>
                <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">
                  {additive?.storageLocation ?? ""}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">規格</p>
                <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">{additive?.spec ?? ""}</p>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">元在庫数</p>
                <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">
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
              {/* 確定デザイン 7139:234090：「自動計算」は 80×48 の白地・緑の枠、注記は太字にしない */}
              <p className="text-sm font-normal text-[var(--semantic-text-primary)] leading-relaxed">
                ※在庫数を修正した場合は、備考欄に理由を記載してください。
              </p>
            </div>

            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="月次定期発注による補充入庫"
                className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
              />
            </div>
          </div>
        </div>

        {editReturn ? (
          /* 差し戻しの編集モード。提出はせず、「編集を保存」で確認待ち詳細の元のステップに戻る（機械器具点検と同じ） */
          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
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
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() =>
              addReturn ? navigate(addReturn.to, { state: addReturn.state }) : navigate(basePath, { state: progressListState })
            }
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            一覧へ戻る
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => (addReturn ? navigate(addReturn.to, { state: addReturn.state }) : handleSave())}
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
