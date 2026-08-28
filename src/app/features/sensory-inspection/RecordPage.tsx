import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { CustomSelect } from "../../components/CustomSelect";
import { ACTORS } from "../cleaning-record/mockData";
import { useSensoryInspection } from "./SensoryInspectionContext";
import {
  CRITERIA,
  products,
  type ComparisonOption,
  type Criterion,
  type CriterionRecord,
} from "./mockData";

function scoreButtonColor(value: number, selected: number | undefined) {
  if (selected !== value) return "bg-[#d0d0d0]";
  return value <= 2 ? "bg-[#f85c5c]" : "bg-[#19c95f]";
}

function NumberButtons({
  criterion,
  selected,
  onSelect,
}: {
  criterion: Criterion;
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="flex gap-4 items-center shrink-0">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`size-12 rounded-lg flex items-center justify-center text-base text-white ${scoreButtonColor(
            value,
            selected
          )}`}
          aria-label={`${criterion} ${value}点`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export function RecordPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { recordsByProduct } = useSensoryInspection();

  const product = products.find((p) => p.id === productId);
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const existing = productId ? recordsByProduct[productId] : null;

  const [date, setDate] = useState(existing?.date ?? "2025-03-24");
  const [manufactureDate, setManufactureDate] = useState(existing?.manufactureDate ?? "2025-03-24");
  const [comparison, setComparison] = useState<ComparisonOption | null>(existing?.comparison ?? null);
  const [comparisonManufactureDate, setComparisonManufactureDate] = useState(
    existing?.comparisonManufactureDate ?? "2025-03-22"
  );
  const [scores, setScores] = useState<Record<Criterion, CriterionRecord | null>>(
    existing?.scores ?? {
      味: null,
      形: null,
      色: null,
      食感: null,
      香り: null,
      とろみ: null,
    }
  );

  const [dialogCriterion, setDialogCriterion] = useState<Criterion | null>(null);
  const [dialogScore, setDialogScore] = useState<number | null>(null);
  const [dialogReason, setDialogReason] = useState("");

  if (!product) {
    return (
      <>
        <AppHeader title="官能検査記録" />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">対象の商品が見つかりません。</p>
        </div>
      </>
    );
  }

  function handleScoreClick(criterion: Criterion, value: number) {
    if (value >= 3) {
      setScores((prev) => ({
        ...prev,
        [criterion]: { score: value, reason: "" },
      }));
    } else {
      setDialogCriterion(criterion);
      setDialogScore(value);
      setDialogReason(scores[criterion]?.reason ?? "");
    }
  }

  function closeDialog() {
    setDialogCriterion(null);
    setDialogScore(null);
    setDialogReason("");
  }

  function confirmDialog() {
    if (!dialogCriterion || dialogScore === null) return;
    if (dialogScore <= 2 && dialogReason.trim() === "") return;
    setScores((prev) => ({
      ...prev,
      [dialogCriterion]: { score: dialogScore, reason: dialogScore <= 2 ? dialogReason : "" },
    }));
    closeDialog();
  }

  const canProceed =
    date !== "" &&
    manufactureDate !== "" &&
    comparison !== null &&
    (comparison === "none" || comparisonManufactureDate !== "") &&
    CRITERIA.every((c) => scores[c] !== null);

  function handleNext() {
    if (!canProceed || !productId) return;
    navigate(`/app/ledger-list/sensory-inspection/products/${productId}/confirm`, {
      state: {
        inspectorName,
        record: {
          date,
          manufactureDate,
          comparison,
          comparisonManufactureDate: comparison === "present" ? comparisonManufactureDate : "",
          scores,
        },
      },
    });
  }

  const dialogConfirmDisabled =
    dialogScore === null || (dialogScore <= 2 && dialogReason.trim() === "");

  return (
    <>
      <AppHeader title="官能検査記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
        <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <div className="flex gap-2 items-center">
            <span className="text-base text-[#808080] w-[90px]">検査商品名</span>
            <span className="text-base text-[var(--semantic-text-primary)]">{product.name}</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-base text-[#808080] w-[90px]">賞味期限</span>
            <span className="text-base text-[var(--semantic-text-primary)]">
              {product.expiryDate.replaceAll("-", "/")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 items-start w-full max-w-full max-w-[480px] mx-40">
          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
            />
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              製造日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <input
              type="date"
              value={manufactureDate}
              onChange={(e) => setManufactureDate(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
            />
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              比較商品 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <CustomSelect
              value={comparison}
              onChange={setComparison}
              options={[
                { value: "none", label: "比較商品なし" },
                { value: "present", label: "比較商品あり" },
              ]}
              placeholder="選択してください"
            />
          </div>

          {comparison === "present" && (
            <>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  比較商品製造日 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <input
                  type="date"
                  value={comparisonManufactureDate}
                  onChange={(e) => setComparisonManufactureDate(e.target.value)}
                  className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
                />
              </div>
            </>
          )}
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="bg-[#ddf3e7] flex flex-col p-2 rounded-lg w-full text-[var(--semantic-text-primary)]">
            <p className="text-base">【点数の評価基準】</p>
            <p className="text-sm leading-[1.6]">　5点・・・標準品と同等の品位が保たれている</p>
            <p className="text-sm leading-[1.6]">　4点・・・標準品よりやや劣るが遜色ない品位が保たれている</p>
            <p className="text-sm leading-[1.6]">　3点・・・標準品より劣るが商品として必要な品位が保たれている</p>
            <p className="text-sm leading-[1.6]">　2点・・・標準品よりかなり劣り商品として不向き</p>
            <p className="text-sm leading-[1.6]">　1点・・・標準品より著しく劣り商品としての品位が失われている</p>
          </div>

          {CRITERIA.map((criterion, index) => (
            <div key={criterion} className="flex flex-col gap-2 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  {criterion} <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <NumberButtons
                  criterion={criterion}
                  selected={scores[criterion]?.score}
                  onSelect={(value) => handleScoreClick(criterion, value)}
                />
              </div>
              {scores[criterion] && scores[criterion]!.score <= 2 && (
                <p className="text-base text-[#808080] px-2">理由：{scores[criterion]!.reason}</p>
              )}
              {index < CRITERIA.length - 1 && <div className="border-t border-[#d0d0d0] w-full" />}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={handleNext}
          className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
            canProceed ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          確認画面へ
        </button>
      </div>

      {dialogCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-4 py-10 w-full max-w-full max-w-[1000px] mx-40 max-h-[90vh] overflow-y-auto mx-16">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">点検箇所</h2>
              <div className="flex flex-col gap-6 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    {dialogCriterion} <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <NumberButtons
                    criterion={dialogCriterion}
                    selected={dialogScore ?? undefined}
                    onSelect={setDialogScore}
                  />
                </div>
                {dialogScore !== null && dialogScore <= 2 && (
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      理由 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <textarea
                      value={dialogReason}
                      onChange={(e) => setDialogReason(e.target.value)}
                      placeholder="理由を記入してください。"
                      className="bg-white p-2 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)] placeholder:font-normal w-full h-[82px] resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeDialog}
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={dialogConfirmDisabled}
                onClick={confirmDialog}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  dialogConfirmDisabled ? "bg-[#d0d0d0]" : "bg-[var(--semantic-brand-primary)]"
                }`}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
