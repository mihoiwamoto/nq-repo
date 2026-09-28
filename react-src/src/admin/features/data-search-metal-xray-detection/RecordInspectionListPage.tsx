import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { Comments } from "../../components/Comments";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

const CheckmarkIconOk = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="#19C95F" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckmarkIconNg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0)">
      <path d="M9.97969 12L4.92893 6.94928C4.37104 6.39139 4.37104 5.48687 4.92893 4.92898C5.48682 4.37109 6.39135 4.37109 6.94924 4.92898L12 9.97974L17.0508 4.92898C17.6087 4.37109 18.5132 4.37109 19.0711 4.92898C19.629 5.48687 19.629 6.39139 19.0711 6.94928L14.0203 12L19.0711 17.0508C19.629 17.6087 19.629 18.5132 19.0711 19.0711C18.5132 19.629 17.6087 19.629 17.0508 19.0711L12 14.0204L6.94924 19.0711C6.39134 19.629 5.48682 19.629 4.92893 19.0711C4.37104 18.5132 4.37104 17.6087 4.92893 17.0508L9.97969 12Z" fill="white"/>
    </g>
  </svg>
);

export function RecordInspectionListPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records: allRecords } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/metal-xray-detection/factories/${factoryId}`;

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
      <PageTitleBar title="点検内容一覧" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/metal-xray-detection" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
        </div>

        {/* Summary Info */}
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">金属探知機</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{record.metalDetectorModel}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">X線探知機</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{record.xrayDetectorModel}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">ウェイトチェッカー</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{record.weightCheckerModel}</p>
          </div>
        </div>

        {/* Inspection Table */}
        {record.records.length > 0 ? (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="flex flex-col">
              <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                <div className="w-[104px] flex items-center justify-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  操作
                </div>
                <div className="w-[80px] flex items-center justify-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  実施区分
                </div>
                <div className="w-[104px] flex items-center justify-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  点検時間
                </div>
                <div className="w-[160px] flex items-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  点検内容
                </div>
                <div className="flex-1 flex items-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  通過製品
                </div>
                <div className="w-[80px] flex items-center justify-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  結果
                </div>
                <div className="w-[200px] flex items-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  備考
                </div>
                <div className="w-[100px] flex items-center justify-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold">
                  実施者
                </div>
              </div>
              {record.records.map((item, idx) => (
                <div key={item.id} className={`flex h-14 items-center ${idx % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}>
                  <div className="w-[104px] flex items-center justify-center px-2 h-full">
                    <Link
                      to={
                        item.content === "テストピース"
                          ? `${basePath}/records/${recordId}/test-piece`
                          : item.content === "異常反応" && item.result === "NG"
                            ? `${basePath}/records/${recordId}/abnormal-reaction`
                            : item.content === "製品通過"
                            ? `${basePath}/records/${recordId}/passed-product`
                            : `${basePath}/records/${recordId}/details`
                      }
                      className="border border-[var(--semantic-brand-primary)] bg-white text-[var(--semantic-brand-primary)] text-base font-bold px-3 py-2 rounded-lg hover:bg-[var(--semantic-brand-primary)] hover:text-white transition-colors"
                    >
                      詳細
                    </Link>
                  </div>
                  <div className="w-[80px] flex items-center justify-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                    {item.category}
                  </div>
                  <div className="w-[104px] flex items-center justify-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                    {item.time}
                  </div>
                  <div className="w-[160px] flex items-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                    {item.content}
                  </div>
                  <div className="flex-1 flex items-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                    {item.passedProduct}
                  </div>
                  <div className={`w-[80px] flex items-center justify-center px-2 h-full gap-2 ${item.result === "NG" ? "bg-[#f85c5c]" : ""}`}>
                    {item.result === "OK" ? (
                      <CheckmarkIconOk />
                    ) : (
                      <CheckmarkIconNg />
                    )}
                  </div>
                  <div className="w-[200px] flex items-center px-2 h-full text-base text-[var(--semantic-text-primary)] truncate">
                    {item.remarks}
                  </div>
                  <div className="w-[100px] flex items-center justify-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                    {item.inspectorName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white flex flex-col gap-2 items-start px-4 py-6 rounded-lg w-full">
            <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">
              検査記録がありません
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments
            comments={[
              { id: "1", author: "鈴木修", timestamp: "2026.08.19 10:39", text: "検索状況を確認しました。問題ありません。" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
