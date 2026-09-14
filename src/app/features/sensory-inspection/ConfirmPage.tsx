import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { useSensoryInspection } from "./SensoryInspectionContext";
import { CRITERIA, products, type SensoryRecord } from "./mockData";

function ConfirmRow({
  label,
  value,
  inspector,
  timestamp,
}: {
  label: string;
  value: string;
  inspector?: string;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-base text-[var(--semantic-text-primary)]">{label}</p>
        <p className="text-base text-[var(--semantic-text-primary)] text-right">{value}</p>
      </div>
      <RecordTimestamp inspector={inspector} timestamp={timestamp} />
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

export function ConfirmPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { submitRecord } = useSensoryInspection();

  const product = products.find((p) => p.id === productId);
  const state = location.state as { inspectorName?: string; record?: SensoryRecord } | null;
  const record = state?.record;
  const inspectorName = state?.inspectorName ?? "";
  // 記録画面で項目ごとに付いた入力時刻。直接URLを開いたときは空
  const timestamps = record?.timestamps ?? {};

  if (!product || !record || !productId) {
    return (
      <>
        <AppHeader title="官能検査記録" />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            点検内容が見つかりません。記録画面から操作してください。
          </p>
        </div>
      </>
    );
  }

  function handleSubmit() {
    if (!productId || !record) return;
    submitRecord(productId, record, inspectorName);
    navigate(`/app/ledger-list/sensory-inspection/products/${productId}/complete`);
  }

  return (
    <>
      <AppHeader title="官能検査記録" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-wrap gap-2 items-center p-4 rounded-lg w-full max-w-full">
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

        <div className="bg-white flex flex-col gap-3 p-4 rounded-lg w-full max-w-full">
          <ConfirmRow label="実施者" value={inspectorName} />
          <HLine />
          <ConfirmRow label="実施日" value={record.date.replaceAll("-", "/")} />
          <HLine />
          <ConfirmRow
            label="製造日"
            value={record.manufactureDate.replaceAll("-", "/")}
            inspector={inspectorName}
            timestamp={timestamps.manufactureDate}
          />
          <HLine />
          <ConfirmRow
            label="比較商品"
            value={record.comparison === "present" ? "比較商品あり" : "比較商品なし"}
            inspector={inspectorName}
            timestamp={timestamps.comparison}
          />
          {record.comparison === "present" && (
            <>
              <HLine />
              <ConfirmRow
                label="比較商品製造日"
                value={record.comparisonManufactureDate.replaceAll("-", "/")}
                inspector={inspectorName}
                timestamp={timestamps.comparisonManufactureDate}
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
                <RecordTimestamp inspector={inspectorName} timestamp={timestamps[criterion]} />
              </div>
            );
          })}
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
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}
