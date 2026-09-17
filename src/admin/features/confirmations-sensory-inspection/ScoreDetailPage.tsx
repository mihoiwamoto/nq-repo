import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { CRITERIA, isAbnormalScore } from "./types";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function ScoreTag({ score }: { score: number }) {
  return (
    <span
      className={`h-6 w-16 rounded-lg flex items-center justify-center text-xl text-white shrink-0 ${
        isAbnormalScore(score) ? "bg-[#f85c5c]" : "bg-[var(--semantic-status-success)]"
      }`}
    >
      {score}
    </span>
  );
}

export function ScoreDetailPage() {
  const { factoryId, recordId, scoreId } = useParams<{
    factoryId: string;
    recordId: string;
    scoreId: string;
  }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/confirmations/sensory-inspection/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);
  const entry = record?.scoreEntries.find((e) => e.id === scoreId);

  if (!record || !entry) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "確認管理", to: "/admin/confirmations" },
          { label: "工場選択", to: "/admin/confirmations/sensory-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "点数一覧", to: `${basePath}/records/${record.id}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{entry.inspectorName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{entry.confirmerName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">比較製品</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {entry.hasComparisonProduct ? "比較製品あり" : "比較製品なし"}
            </p>
          </div>
          {entry.hasComparisonProduct && (
            <>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">比較製品製造日</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">
                  {entry.comparisonManufactureDate ? formatDate(entry.comparisonManufactureDate) : ""}
                </p>
              </div>
            </>
          )}
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(entry.date)}</p>
          </div>
          {CRITERIA.map((criterion) => {
            const { score, reason, action, timestamp } = entry.scores[criterion];
            const abnormal = isAbnormalScore(score);
            return (
              <div key={criterion} className="flex flex-col gap-1 items-start w-full">
                <div className="border-t border-[#d0d0d0] w-full" />
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">{criterion}</p>
                  <ScoreTag score={score} />
                </div>
                {abnormal && (reason || action) && (
                  <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
                    {reason && <p>原因：{reason}</p>}
                    {action && <p>対応：{action}</p>}
                  </div>
                )}
                {/* アプリで点数を入れたときのスタンプ */}
                <RecordTimestamp inspector={entry.inspectorName} timestamp={timestamp} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
