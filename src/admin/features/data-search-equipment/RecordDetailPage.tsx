import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { CommentsSection } from "../../components/CommentsSection";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function formatTime(timestamp: string) {
  const [, time] = timestamp.split(" ");
  return time;
}

const CheckmarkIconOk = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" className="text-[#19C95F]"/>
  </svg>
);

const CheckmarkIconNg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0)">
      <path d="M9.97969 12L4.92893 6.94928C4.37104 6.39139 4.37104 5.48687 4.92893 4.92898C5.48682 4.37109 6.39135 4.37109 6.94924 4.92898L12 9.97974L17.0508 4.92898C17.6087 4.37109 18.5132 4.37109 19.0711 4.92898C19.629 5.48687 19.629 6.39139 19.0711 6.94928L14.0203 12L19.0711 17.0508C19.629 17.6087 19.629 18.5132 19.0711 19.0711C18.5132 19.629 17.6087 19.629 17.0508 19.0711L12 14.0204L6.94924 19.0711C6.39134 19.629 5.48682 19.629 4.92893 19.0711C4.37104 18.5132 4.37104 17.6087 4.92893 17.0508L9.97969 12Z" fill="white"/>
    </g>
  </svg>
);

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/equipment-inspection/factories/${factoryId}`;

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
          { label: "工場選択", to: "/admin/data-search/equipment-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧", to: `${basePath}/records/${recordId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-0 p-6 bg-white min-h-[calc(100vh-200px)]">
        <div className="bg-white flex flex-col gap-6 px-0 py-0 w-full">
          {/* Factory Name */}
          <div className="flex items-center gap-3">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>

          {/* Summary Info - Operator and Inspection Point */}
          <div className="flex flex-col gap-3 pb-4 border-b border-[#e0e0e0]">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">実施者</p>
                <p className="text-[16px] font-bold text-[var(--semantic-text-primary)]">{record.implementer}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">確認者</p>
                <p className="text-[16px] font-bold text-[var(--semantic-text-primary)]">{record.confirmer}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">点検内容</p>
              <p className="text-[16px] font-bold text-[var(--semantic-text-primary)]">動作確認</p>
            </div>
          </div>

          {/* Metal Detector Section */}
          <div className="flex flex-col gap-0 pt-4">
            <div className="bg-[#00a651] text-white font-bold px-4 py-2 mx-3 rounded-t">
              金属探知機
            </div>
            <div className="bg-white border border-[#e0e0e0] border-t-0 mx-3 rounded-b flex flex-col gap-4 p-4">
              <div className="flex justify-between items-start">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">点検時間</p>
                <div className="flex flex-col items-end">
                  <p className="text-[16px] font-bold text-[var(--semantic-text-primary)]">08:25</p>
                  <p className="text-xs text-[#999999]">{record.implementer}, {formatDate(record.date)} 08:25</p>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">電源ON</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">電源が正常に入り始動する</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">操作パネルに異常がなく操作できる</p>
                <p className="text-[12px] text-[#808080]">原因：選択肢</p>
                <p className="text-[12px] text-[var(--semantic-text-primary)]">テキストテキストテキストテキストテキストテキスト</p>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">コンベア・プーリー・モーター</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">ゆるみ、破損、汚れ、異音がなく正常に作動する</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">ローラーに引っ掛かりがないか（サーチコイルに接触していないか）</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">設定</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">各設定書書がましいか</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">はねばん（フリッパー）</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">正常に反応し作動する</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e0e0e0] my-4" />

            {/* Metal Detector Comments */}
            <div className="pt-4">
              <CommentsSection comments={record.metalComments || []} />
            </div>
          </div>

          {/* X-ray Detector Section */}
          <div className="flex flex-col gap-0">
            <div className="bg-[#00a651] text-white font-bold px-4 py-2 mx-3 rounded-t">
              X線探知機
            </div>
            <div className="bg-white border border-[#e0e0e0] border-t-0 mx-3 rounded-b flex flex-col gap-4 p-4">
              <div className="flex justify-between items-start">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">点検時間</p>
                <div className="flex flex-col items-end">
                  <p className="text-[16px] font-bold text-[var(--semantic-text-primary)]">08:25</p>
                  <p className="text-xs text-[#999999]">{record.implementer}, {formatDate(record.date)} 08:25</p>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">電源ON</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">電源が正常に入り始動する</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">操作パネルに異常がなく操作できる</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">コンベア・センサー</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">ゆるみ、破損、汚れ、異音がなく正常に作動する</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">機械同士の接触が無いか</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0]"></div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">はねばん（フリッパー）</p>
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-normal">正常に反応し作動する</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-[#00a651] text-white text-xs font-bold px-3 py-1 rounded">正常</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e0e0e0] my-4" />

            {/* X-ray Detector Comments */}
            <div className="pt-4">
              <CommentsSection comments={record.xrayComments || []} />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-2 pt-4 pb-6 border-t border-[#e0e0e0]">
            <p className="text-[14px] text-[var(--semantic-text-secondary)] font-normal">備考</p>
            <p className="text-[14px] text-[var(--semantic-text-primary)]">
              テキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
            </p>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-[#e0e0e0]">
            <Comments comments={record.comments || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
