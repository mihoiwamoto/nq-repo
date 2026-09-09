import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function formatTime(timestamp: string) {
  const [, time] = timestamp.split(" ");
  return time;
}

interface InspectionItemWithContext {
  itemIndex: number;
  sessionIndex: number;
  pointIndex: number;
}

export function InspectionItemDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/equipment-inspection/factories/${factoryId}`;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [recordId]);

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  // Get the first NG item (異常反応) for display
  let selectedItem = null;
  let session = null;

  for (const sess of record.sessions) {
    for (const point of sess.points) {
      const ngItem = point.items.find((item) => item.status === "ng");
      if (ngItem) {
        selectedItem = ngItem;
        session = sess;
        break;
      }
    }
    if (selectedItem) break;
  }

  if (!selectedItem || !session) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">異常反応が見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/equipment-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧", to: `${basePath}/records/${recordId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        {/* Factory Name */}
        <div className="flex items-center gap-3">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
        </div>

        {/* Detail Information Section */}
        <div className="bg-white flex flex-col gap-0 rounded-lg overflow-hidden">
          {/* 実施者 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">実施者</p>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[var(--semantic-text-primary)]">{selectedItem.inspector}</p>
            </div>
          </div>

          {/* 点検内容 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">点検内容</p>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[var(--semantic-text-primary)]">{selectedItem.name}</p>
            </div>
          </div>

          {/* 点検時間 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">点検時間</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[14px] text-[var(--semantic-text-primary)]">{formatTime(selectedItem.timestamp)}</p>
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">実施者名, {formatDate(record.date)} HH:mm</p>
            </div>
          </div>

          {/* 異常製品 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">異常製品</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[14px] text-[var(--semantic-text-primary)]">マンゴープリン　ストレート　1kg</p>
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">実施者名, {formatDate(record.date)} HH:mm</p>
            </div>
          </div>

          {/* 通過数量 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">通過数量</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[14px] text-[var(--semantic-text-primary)]">200</p>
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">実施者名, {formatDate(record.date)} HH:mm</p>
            </div>
          </div>

          {/* 異常数量 */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">異常数量</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[14px] text-[var(--semantic-text-primary)]">5</p>
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">実施者名, {formatDate(record.date)} HH:mm</p>
            </div>
          </div>

          {/* 原因 */}
          <div className="flex items-start justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1 pt-3">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">原因</p>
            </div>
            <div className="flex-1 flex flex-col items-end">
              <div className="w-full bg-[#f5f5f5] rounded p-3 min-h-[60px] flex items-start">
                <p className="text-[14px] text-[var(--semantic-text-primary)]">
                  {selectedItem.cause || "異物混入\nテキストテキストテキストテキストテキストテキストテキスト"}
                </p>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal mt-2">実施者名, {formatDate(record.date)} HH:mm</p>
            </div>
          </div>

          {/* 対応 */}
          <div className="flex items-start justify-between px-4 py-4 border-b border-[#e8e8e8]">
            <div className="flex-1 pt-3">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">対応</p>
            </div>
            <div className="flex-1 flex flex-col items-end">
              <div className="w-full bg-[#f5f5f5] rounded p-3 min-h-[60px] flex items-start">
                <p className="text-[14px] text-[var(--semantic-text-primary)]">
                  {selectedItem.action || "点検調整\nテキストテキストテキストテキストテキストテキストテキスト"}
                </p>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal mt-2">実施者名, {formatDate(record.date)} HH:mm</p>
            </div>
          </div>

          {/* 備考 */}
          <div className="flex items-start justify-between px-4 py-4">
            <div className="flex-1 pt-3">
              <p className="text-[14px] font-bold text-[var(--semantic-text-primary)]">備考</p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-[#f5f5f5] rounded p-3 min-h-[60px] flex items-start">
                <p className="text-[14px] text-[var(--semantic-text-primary)] text-[#999999]">
                  テキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
