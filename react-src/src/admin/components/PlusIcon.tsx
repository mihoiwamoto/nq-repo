import iconPlus from "../../assets/figma/icons/common/plus.svg";

/** 「＋ 新規登録」などの＋。確定デザインは文字ではなく 20px の細い＋のアイコン（2026-10-08 に各画面の文字の「+」をこれにそろえた） */
export function PlusIcon({ className = "size-5" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{
        WebkitMaskImage: `url("${iconPlus}")`,
        maskImage: `url("${iconPlus}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        backgroundColor: "currentColor",
      }}
    />
  );
}
