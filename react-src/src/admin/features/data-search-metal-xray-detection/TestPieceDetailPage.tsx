import { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import iconArrowDown from "../../../assets/figma/icons/common/arrow-down.svg";

const TEST_PIECE_DATA = {
  metalDetector: {
    model: "GM-500S",
    items: [
      {
        time: "08:25",
        settingNumber: "1",
        pieces: [
          { name: "テストピース：Fe", value: "2.0" },
          { name: "検知確認：Fe", status: "正常" },
          { name: "テストピース：Sus", value: "3.0" },
          { name: "検知確認：Sus", status: "正常" },
        ],
      },
    ],
  },
  xrayDetector: {
    model: "XR-300",
    items: [
      {
        time: "08:25",
        settingNumber: "1",
        pieces: [
          { name: "テストピース：Sus球", value: "2.0" },
          { name: "検知確認：Sus球", status: "正常" },
          { name: "テストピース：Sus線", value: "3.0" },
          { name: "検知確認：Sus線", status: "正常" },
          { name: "テストピース：ガラス球", value: "3.0" },
          { name: "検知確認：ガラス球", status: "正常" },
          { name: "テストピース：セラミック", value: "3.0" },
          { name: "検知確認：セラミック", status: "正常" },
          { name: "テストピース：ゴム球", value: "3.0" },
          { name: "検知確認：ゴム球", status: "正常" },
        ],
      },
    ],
  },
};

function StatusTag({ status }: { status: string }) {
  return (
    <span className="bg-[#19c95f] flex items-center justify-center h-7 w-[88px] rounded-lg text-sm text-white">
      {status}
    </span>
  );
}

function TestPieceSection({
  title,
  model,
  items,
  inspectorName,
}: {
  title: string;
  model: string;
  items: Array<{
    time: string;
    settingNumber: string;
    pieces: Array<{ name: string; value?: string; status?: string }>;
  }>;
  inspectorName: string;
}) {
  return (
    <>
      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="bg-[#094] flex flex-col gap-2 items-start justify-center p-2 rounded-lg w-full">
          <div className="flex gap-6 items-center justify-center w-full">
            <div className="flex-1">
              <p className="text-xl font-semibold text-white">{title}</p>
            </div>
            <p className="text-xl font-semibold text-white">{model}</p>
          </div>
        </div>

        {items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[#333]">点検時間</p>
              <p className="text-xl text-[#333]">{item.time}</p>
            </div>
            {item.time && (
              <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                {inspectorName} 2026/08/27 08:25
              </p>
            )}
            {itemIndex === 0 && item.pieces.length > 0 && (
              <div className="border-t border-[#d0d0d0]" />
            )}

            {item.pieces.map((piece, pieceIndex) => {
              const isStatus = piece.status !== undefined;
              return (
                <div key={pieceIndex} className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[#333]">{piece.name}</p>
                    {isStatus ? (
                      <StatusTag status={piece.status} />
                    ) : (
                      <p className="text-xl text-[#333]">{piece.value}</p>
                    )}
                  </div>
                  {pieceIndex < item.pieces.length - 1 && (
                    <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                      {inspectorName} 2026/08/27 08:25
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export function TestPieceDetailPage() {
  const { factoryId, recordId } = useParams<{
    factoryId: string;
    recordId: string;
  }>();
  const { records } = useRecords();
  const navigate = useNavigate();
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
        <p className="text-base text-[#666]">データが見つかりません</p>
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
          <p className="text-xl text-[#333]">{factoryName}</p>
        </div>

        <div className="bg-white rounded-lg w-full overflow-hidden">
          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-center w-full">
              <div className="flex-1">
                <p className="text-xl font-semibold text-[#333]">実施者</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl text-[#333]">田中太郎</p>
              </div>
            </div>
          </div>

          <div className="px-4">
            <div className="border-t border-[#d0d0d0]" />
          </div>

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-center w-full">
              <div className="flex-1">
                <p className="text-xl font-semibold text-[#333]">点検内容</p>
              </div>
              <p className="text-xl text-[#333]">テストピース</p>
            </div>
          </div>

          <div className="px-4">
            <div className="border-t border-[#d0d0d0]" />
          </div>

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[#333]">実施区分</p>
              <p className="text-xl text-[#333]">開始</p>
            </div>
          </div>

          <div className="px-4">
            <div className="border-t border-[#d0d0d0]" />
          </div>

          <div className="flex flex-col gap-2 px-4 py-6">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[#333]">通過製品/カテゴリ</p>
              <p className="text-xl text-[#333]">マンゴープリン　ストレート　1kg</p>
            </div>
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">田中太郎 2026/08/27 08:25</p>
          </div>

          <TestPieceSection
            title="金属探知機"
            model={TEST_PIECE_DATA.metalDetector.model}
            items={TEST_PIECE_DATA.metalDetector.items}
            inspectorName="佐藤花子"
          />

          <TestPieceSection
            title="X線探知機"
            model={TEST_PIECE_DATA.xrayDetector.model}
            items={TEST_PIECE_DATA.xrayDetector.items}
            inspectorName="山田次郎"
          />

          <div className="px-4">
            <div className="border-t border-[#d0d0d0]" />
          </div>

          <div className="flex flex-col gap-2 px-4 py-6">
            <p className="text-xl font-semibold text-[#333]">備考</p>
            <p className="text-base text-[#333]">
              テストピースの検査を実施しました。全ての検査項目において正常に検知確認されました。機械の動作に異常はありません。次回の検査予定は2026年9月27日です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
