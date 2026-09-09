import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";

function formatDate(date: string | undefined) {
  return date ? date.replaceAll("-", "/") : "ー";
}

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/sample-management/factories/${factoryId}`;

  useLayoutEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
    requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (main) {
        main.scrollTop = 0;
      }
    });
  }, [recordId]);

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/sample-management" },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="bg-white flex flex-wrap gap-x-16 gap-y-6 items-center p-4 rounded-lg w-full">
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">製品名</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.productName}</p>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">賞味期限</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{formatDate(record.expirationDate)}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
              {record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">製造日</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.manufactureDate)}</p>
              {record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">検体種別</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.sampleType}</p>
              {record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">検体数量</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.sampleQuantity}</p>
              {record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">単位</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.unit}</p>
              {record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-start justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">保管場所</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.storageLocation}</p>
              {record.timestamp && (
                <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                  {record.timestamp}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          {record.remarks && (
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">検体状況</p>
          <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">状態</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.status}</p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">破棄日</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.discardedDate)}</p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">理由</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{record.discardReason ?? "ー"}</p>
              </div>
              {record.discardReason === "その他" && record.discardReasonNote && (
                <p className="text-base text-[var(--semantic-text-secondary)] font-normal">{record.discardReasonNote}</p>
              )}
            </div>
          </div>
        </div>

        {/* Comments Display Section */}
        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
        </div>
      </div>
    </div>
  );
}
