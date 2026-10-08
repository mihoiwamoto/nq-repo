import iconPlus from "../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../assets/figma/icons/common/minus.svg";

/**
 * 「絞り込み検索 ＋／－」の中身。確定デザイン（7139:258563・7139:162777 など）は「＋」を文字ではなく
 * 20px のアイコンで出す（2026-10-08 に各画面の文字の「+」「−」をこれにそろえた）
 */
export function FilterToggleLabel({ open }: { open: boolean }) {
  const icon = open ? iconMinus : iconPlus;
  return (
    <>
      <span>絞り込み検索</span>
      <span
        aria-hidden
        className="inline-block size-5 shrink-0"
        style={{
          WebkitMaskImage: `url("${icon}")`,
          maskImage: `url("${icon}")`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          backgroundColor: "var(--semantic-brand-primary)",
        }}
      />
    </>
  );
}
