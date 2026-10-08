import iconArrowLeft from "../../assets/figma/icons/common/arrow-left.svg";

/**
 * ヘッダー右の「点検済み n/m」のつまみ（ラインの一覧・提出内容の確認で使う）。
 * 確定デザイン（7139:282586 の ProgressContainer）：80×46、ヘッダーの右端にくっつけて左の角だけ丸め、影を付ける。
 * 左は緑 24px（矢印）、右は白 56px（「点検済み」12px と 数 20px）。
 * AppHeader の px-4 を -mr-4 で打ち消して右端に寄せる。
 */
export function LineProgressButton({
  inspectedCount,
  total,
  onClick,
}: {
  inspectedCount: number;
  total: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mr-4 bg-[var(--semantic-brand-primary)] flex h-[46px] items-stretch rounded-l-lg overflow-hidden shrink-0 shadow-[0px_2px_6px_rgba(51,51,51,0.24)] hover:opacity-90 transition-opacity"
    >
      <span className="flex items-center justify-center w-6 shrink-0">
        <span
          aria-hidden
          className="inline-block size-6 shrink-0 text-white"
          style={{
            WebkitMaskImage: `url("${iconArrowLeft}")`,
            maskImage: `url("${iconArrowLeft}")`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            backgroundColor: "currentColor",
          }}
        />
      </span>
      <span className="bg-white flex flex-col items-center justify-center gap-0.5 px-1 min-w-14">
        <span className="text-xs leading-none text-[var(--semantic-brand-primary)] font-semibold whitespace-nowrap">点検済み</span>
        <span className="text-xl leading-none text-[var(--semantic-brand-primary)] font-semibold whitespace-nowrap">
          {inspectedCount}/{total}
        </span>
      </span>
    </button>
  );
}
