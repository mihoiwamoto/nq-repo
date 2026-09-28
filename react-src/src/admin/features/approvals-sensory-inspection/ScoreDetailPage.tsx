import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useRecords } from "./RecordsContext";
import { CRITERIA, isAbnormalScore } from "./types";

const basePath = "/admin/approvals/sensory-inspection";

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
  const { recordId, scoreId } = useParams<{ recordId: string; scoreId: string }>();
  const { records } = useRecords();

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
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: basePath },
          { label: "点数一覧", to: `${basePath}/records/${record.id}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex flex-wrap gap-8 items-center p-4 rounded-lg w-full">
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">検査製品名</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.productName}</p>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">製造日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {formatDate(record.manufactureDate)}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">賞味期限</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{formatDate(record.expiryDate)}</p>
          </div>
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
            const { score, reason, timestamp } = entry.scores[criterion];
            const abnormal = isAbnormalScore(score);
            return (
              <div key={criterion} className="flex flex-col gap-1 items-start w-full">
                <div className="border-t border-[#d0d0d0] w-full" />
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">{criterion}</p>
                  <ScoreTag score={score} />
                </div>
                {abnormal && reason && (
                  <p className="text-base text-[var(--semantic-text-secondary)] px-2">原因：{reason}</p>
                )}
                {timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                    {entry.inspectorName} {timestamp}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
