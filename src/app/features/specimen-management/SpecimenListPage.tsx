import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useDemoList } from "../../../components/demo/demoStore";

interface SpecimenItem {
  id: string;
  productName: string;
  expiryDate: string;
}

const SPECIMEN_ENTRIES: SpecimenItem[] = [
  {
    id: "specimen-1",
    productName: "厚焼き玉子（本） 500g",
    expiryDate: "2024/12/31",
  },
  {
    id: "specimen-2",
    productName: "仕出しした巻き玉子 冷凍",
    expiryDate: "2024/11/30",
  },
  {
    id: "specimen-3",
    productName: "スクランブルエッグ（冷凍）　350g",
    expiryDate: "2024/10/15",
  },
];

export function SpecimenListPage() {
  const navigate = useNavigate();
  // 動作デモの「データが無い」を試している間は、検体が 1 件も無い状態にする
  const specimens = useDemoList(SPECIMEN_ENTRIES);

  function handleConfirm(item: SpecimenItem) {
    navigate(`/app/ledger-list/specimen-management/specimens/${item.id}/confirm`, {
      state: {
        productName: item.productName,
        expiryDate: item.expiryDate,
        inspectorName: "山田太郎",
        inspectionDate: "2024-12-20",
        manufactureDate: "2024-11-01",
        specimenType: "製品or小分け",
        quantity: "100",
        unit: "個",
        storageLocation: "冷凍庫A",
        remarks: "特に問題なし",
        timestamp: "2024/12/20 14:30",
      },
    });
  }

  return (
    <>
      <AppHeader title="検体管理" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 pb-24 flex flex-col gap-4 items-center">
        <div className="w-full max-w-[480px]">
          <h2 className="text-lg font-semibold text-[#333] mb-4">検体一覧</h2>
          <div className="flex flex-col gap-3">
            {specimens.length === 0 && (
              <p className="text-base text-[#808080] text-center py-6">
                保管中の検体はまだありません
              </p>
            )}
            {specimens.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg border border-[#d0d0d0] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#333]">{item.productName}</p>
                    <p className="text-sm text-[#808080]">賞味期限: {item.expiryDate}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfirm(item)}
                    className="bg-[#094] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#07a] transition-colors"
                  >
                    確認画面へ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
