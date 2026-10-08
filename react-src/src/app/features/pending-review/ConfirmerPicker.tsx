// 確認待ちの「確認者を選んでください」のポップアップ。
// 確定デザイン（7139:221059、差し戻しは 7139:229072）では確認待ちの一覧の上に重ねて出すので、
// 一覧（PendingReviewListPage）と、詳細を直に開いたとき（PendingReviewDetailPage）の両方から使う（2026-10-07）。

export type Confirmer = { id: string; name: string };

const EQUIPMENT_CONFIRMERS: Confirmer[] = [
  { id: "1689923", name: "鈴木翔人" },
  { id: "1958473", name: "辻原由貴" },
  { id: "1846289", name: "伊藤裕太" },
];

const CLEANING_CONFIRMERS: Confirmer[] = [
  { id: "1035921", name: "加藤由美" },
  { id: "1058473", name: "鈴木雅人" },
  { id: "1046289", name: "伊藤裕太" },
];

const GLASS_PLASTIC_CONFIRMERS: Confirmer[] = [
  { id: "1078462", name: "中村彩香" },
  { id: "1092837", name: "藤田健太" },
  { id: "1064523", name: "小川美穂" },
];

const ADDITIVE_CONFIRMERS: Confirmer[] = [
  { id: "3041587", name: "山本真理" },
  { id: "2758463", name: "渡辺誠一" },
  { id: "3192706", name: "小林幸恵" },
];

const SCALE_CONFIRMERS: Confirmer[] = [
  { id: "2214587", name: "岡本さゆり" },
  { id: "2298431", name: "村上健二" },
  { id: "2276104", name: "石井美穂" },
];

const SENSORY_CONFIRMERS: Confirmer[] = [
  { id: "2531478", name: "小野寺薫" },
  { id: "2547903", name: "堤幸雄" },
  { id: "2569012", name: "森田千夏" },
];

const METAL_XRAY_CONFIRMERS: Confirmer[] = [
  { id: "2103458", name: "西村千夏" },
  { id: "2117623", name: "橋本大輔" },
  { id: "2129804", name: "松井理沙" },
];

/** 帳票ごとの確認者の見本 */
export function confirmersFor(ledgerSlug: string | undefined): Confirmer[] {
  switch (ledgerSlug) {
    case "cleaning-record":
      return CLEANING_CONFIRMERS;
    case "glass-plastic":
      return GLASS_PLASTIC_CONFIRMERS;
    case "additive-management":
      return ADDITIVE_CONFIRMERS;
    case "scale-inspection":
      return SCALE_CONFIRMERS;
    case "sensory-inspection":
      return SENSORY_CONFIRMERS;
    case "metal-xray-detection":
      return METAL_XRAY_CONFIRMERS;
    default:
      return EQUIPMENT_CONFIRMERS;
  }
}

/** 「次へ」で開く詳細の最初の表示（検体管理だけは確認画面から） */
export function stepAfterConfirmer(ledgerSlug: string | undefined): "detail" | "confirmation" {
  return ledgerSlug === "sample-management" ? "confirmation" : "detail";
}

export function ConfirmerPickerDialog({
  people,
  selectedId,
  onSelect,
  onClose,
  onNext,
}: {
  people: Confirmer[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
        <h2 className="-mb-4 text-2xl text-black">確認者を選んでください</h2>
        <div className="grid grid-cols-3 gap-4 w-full content-start overflow-y-auto overflow-x-hidden flex-1">
          {people.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`h-[78px] rounded-lg flex flex-col items-center justify-center gap-1 px-4 shadow-[0px_2px_6px_rgba(51,51,51,0.24)] ${
                selectedId === c.id
                  ? "bg-white border-2 border-[var(--semantic-brand-primary)]"
                  : "bg-white border-2 border-transparent"
              }`}
            >
              <span className="text-lg leading-[1.4] text-[var(--semantic-text-primary)]">{c.name}</span>
              <span className="text-sm text-[var(--semantic-text-secondary)]">{c.id}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-10 items-center justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)] font-semibold"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white font-semibold"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
