import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";

const StatusTag = ({ status = "正常" }: { status?: string }) => (
  <div className="bg-[#19c95f] text-white text-[16px] font-bold px-2 py-1 rounded-lg w-[88px] flex items-center justify-center h-[28px]">
    {status}
  </div>
);

export function PassedProductDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/metal-xray-detection/factories/${factoryId}`;

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
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/metal-xray-detection" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧", to: `${basePath}/records/${recordId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-2xl font-bold text-[#333]">{factoryName}</p>
        </div>

        <div className="bg-white rounded-lg w-full overflow-hidden">
          <div className="flex flex-col gap-0">
            {/* 実施者 */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <p className="text-2xl font-bold text-[#333] w-48">実施者</p>
              <p className="text-2xl font-bold text-[#333]">田中太郎</p>
            </div>

            {/* 点検内容 */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <p className="text-2xl font-bold text-[#333] w-48">点検内容</p>
              <p className="text-2xl font-bold text-[#333]">製品通過</p>
            </div>

            {/* 実施区分 */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <p className="text-2xl font-bold text-[#333] w-48">実施区分</p>
              <p className="text-2xl font-bold text-[#333]">開始</p>
            </div>

            {/* 通過製品/カテゴリ */}
            <div className="flex flex-col px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <div className="flex items-center mb-2">
                <p className="text-2xl font-bold text-[#333] w-48 whitespace-nowrap">通過製品/カテゴリ</p>
                <p className="text-2xl font-bold text-[#333] whitespace-nowrap ml-auto">マンゴープリン　ストレート　1kg</p>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">田中太郎 2026/08/28 08:40</p>
            </div>

            {/* ウェイトチェッカーセクション */}
            <div className="border-t border-[#d0d0d0] mx-4" />
            <div className="bg-[#094] px-4 py-2 rounded-lg m-4 text-white font-bold text-2xl mb-2">
              ウェイトチェッカー <span className="float-right">WC-2024-001</span>
            </div>

            <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-[#333] w-48">点検時間</p>
                <p className="text-2xl font-bold text-[#333]">08:40</p>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">田中太郎 2026/08/28 08:40</p>
            </div>

            <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-[#333] w-48">重量下限値（g）</p>
                <p className="text-2xl font-bold text-[#333]">1</p>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">田中太郎 2026/08/28 08:40</p>
            </div>

            {/* 動作確認 */}
            <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <p className="text-2xl font-bold text-[#094] mb-4">動作確認</p>

              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-[#333] w-80">分銅を乗せての校正点検</p>
                <StatusTag status="正常" />
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal mb-4">田中太郎 2026/08/28 08:40</p>

              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-[#333] w-80">通過させる製品のパッケージ（印字）との照合</p>
                <StatusTag status="正常" />
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal mb-4">田中太郎 2026/08/28 08:40</p>
            </div>

            {/* シーリングセクション */}
            <div className="border-t border-[#d0d0d0] mx-4" />
            <div className="bg-[#094] px-4 py-2 rounded-lg m-4 text-white font-bold text-2xl mb-2">
              シーリング <span className="float-right">SL-2024-005</span>
            </div>

            <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-[#333] w-48">点検時間</p>
                <p className="text-2xl font-bold text-[#333]">08:40</p>
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">田中太郎 2026/08/28 08:40</p>
            </div>

            <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-[#333] w-48">動作確認</p>
                <StatusTag status="正常" />
              </div>
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">田中太郎 2026/08/28 08:40</p>
            </div>

            <div className="border-t border-[#d0d0d0] mx-4" />

            {/* 備考 */}
            <div className="flex flex-col px-4 py-4 mx-4">
              <p className="text-2xl font-bold text-[#333] mb-2 w-48">備考</p>
              <p className="text-base text-[#333]">本日の通過検査を完了しました。全ての装置が正常に動作しており、検査品質も良好です。問題ありません。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
