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

export function AbnormalReactionDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/equipment-inspection/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  // Find the first NG item (異常反応)
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
          <div className="px-4 py-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{selectedItem.inspector}</p>
            </div>
          </div>

          {/* 点検内容 */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">点検内容</p>
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">異常反応</p>
            </div>
          </div>

          {/* 点検時間 */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">点検時間</p>
              <div className="text-right">
                <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{formatTime(selectedItem.timestamp)}</p>
                {selectedItem.timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{selectedItem.inspector}, {formatDate(record.date)} {formatTime(selectedItem.timestamp)}</p>
                )}
              </div>
            </div>
          </div>

          {/* 異常製品 */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">異常製品</p>
              <div className="text-right">
                <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">マンゴープリン　ストレート　1kg</p>
                {selectedItem.timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{selectedItem.inspector}, {formatDate(record.date)} {formatTime(selectedItem.timestamp)}</p>
                )}
              </div>
            </div>
          </div>

          {/* 通過数量 */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">通過数量</p>
              <div className="text-right">
                <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">200</p>
                {selectedItem.timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{selectedItem.inspector}, {formatDate(record.date)} {formatTime(selectedItem.timestamp)}</p>
                )}
              </div>
            </div>
          </div>

          {/* 異常数量 */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">異常数量</p>
              <div className="text-right">
                <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">5</p>
                {selectedItem.timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{selectedItem.inspector}, {formatDate(record.date)} {formatTime(selectedItem.timestamp)}</p>
                )}
              </div>
            </div>
          </div>

          {/* 原因 */}
          <div className="px-4 py-6 border-b border-[#d0d0d0]">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">原因</p>
              <div className="text-right flex-shrink-0">
                <p className="text-[20px] text-[var(--semantic-text-primary)]">{selectedItem.cause || "異物混入"}</p>
                {selectedItem.timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] font-normal mt-1">{selectedItem.inspector}, {formatDate(record.date)} {formatTime(selectedItem.timestamp)}</p>
                )}
              </div>
            </div>
            <p className="text-base text-[#999999] leading-relaxed max-w-[60%] mt-2">
              検査工程で異物が検出されました。金属探知機により異物混入が確認されたため、当該製品は廃棄処分としました。
            </p>
          </div>

          {/* 対応 */}
          <div className="px-4 py-6 border-b border-[#d0d0d0]">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">対応</p>
              <div className="text-right flex-shrink-0">
                <p className="text-[20px] text-[var(--semantic-text-primary)]">{selectedItem.action || "点検調整"}</p>
                {selectedItem.timestamp && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] font-normal mt-1">{selectedItem.inspector}, {formatDate(record.date)} {formatTime(selectedItem.timestamp)}</p>
                )}
              </div>
            </div>
            <p className="text-base text-[#999999] leading-relaxed max-w-[60%] mt-2">
              金属探知機の感度を再調整し、校正用テストピースで動作確認を実施しました。その後、製品の再処理ラインで検査を再開しています。
            </p>
          </div>

          {/* 備考 */}
          <div className="flex flex-col px-4 py-6">
            <p className="text-[20px] text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-primary)] leading-relaxed mt-2">
              異常検知後、直ちに製造ラインを一時停止し、該当ロットの製品を隔離しました。金属探知機の校正テストを実施し、正常に復帰したことを確認後、製造を再開しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
