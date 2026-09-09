import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import { useSensoryInspection } from "./SensoryInspectionContext";
import { CRITERIA } from "./mockData";

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between w-full">
      <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
      <p className="text-base text-[var(--semantic-text-primary)] text-right">{value}</p>
    </div>
  );
}

function ScoreTag({ score }: { score: number }) {
  return (
    <span
      className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
      style={{ backgroundColor: score <= 2 ? "#f85c5c" : "#19c95f" }}
    >
      {score}
    </span>
  );
}

const HLine = () => <div className="border-t border-[#d0d0d0] w-full" />;

export function ReviewPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, recordsByProduct } = useSensoryInspection();

  const product = products.find((p) => p.id === productId);
  const record = productId ? recordsByProduct[productId] : null;
  const locked = (location.state as { locked?: boolean } | null)?.locked ?? false;

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

  return (
    <>
      <AppHeader title="官能検査記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="flex justify-end w-full max-w-full max-w-[480px] mx-40">
          {!locked && (
            <Link
              to={`/app/ledger-list/sensory-inspection/products/${productId}`}
              className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center h-10 px-4 rounded-lg text-sm text-[var(--semantic-brand-primary)]"
            >
              <img src={iconEdit} alt="編集" className="size-5" />
              編集
            </Link>
          )}
        </div>

        <div className="bg-white flex flex-wrap gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
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

        <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <ConfirmRow label="実施者" value={product.inspectorName} />
          <HLine />
          <ConfirmRow label="実施日" value={product.date ? product.date.replaceAll("-", "/") : ""} />
          {record && (
            <>
              <HLine />
              <ConfirmRow label="製造日" value={record.manufactureDate.replaceAll("-", "/")} />
              <HLine />
              <ConfirmRow
                label="比較商品"
                value={record.comparison === "present" ? "比較商品あり" : "比較商品なし"}
              />
              {record.comparison === "present" && (
                <>
                  <HLine />
                  <ConfirmRow
                    label="比較商品製造日"
                    value={record.comparisonManufactureDate.replaceAll("-", "/")}
                  />
                </>
              )}
              {CRITERIA.map((criterion) => {
                const score = record.scores[criterion];
                if (!score) return null;
                return (
                  <div key={criterion} className="flex flex-col gap-1 w-full">
                    <HLine />
                    <div className="flex items-center justify-between w-full">
                      <p className="text-base text-[var(--semantic-text-primary)]">{criterion}</p>
                      <ScoreTag score={score.score} />
                    </div>
                    {score.score <= 2 && (
                      <p className="text-base text-[#808080] px-2">理由：{score.reason}</p>
                    )}
                  </div>
                );
              })}
            </>
          )}
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
      </div>
    </>
  );
}
