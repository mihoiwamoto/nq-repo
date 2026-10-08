import { Link } from "react-router-dom";
import iconArrowRight from "../../assets/figma/icons/common/arrow-right.svg";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    // data-nq-part は画面説明のコーチマーク（coachMarks.ts）が「パンくず」を見つけるための印。見た目には影響しない
    // 確定デザイン：帯の高さ 48px（文字の行の高さ 14px）、文字 → 矢印 → 文字 は 32px（2026-10-07）
    <div data-nq-part="breadcrumb" className="flex items-center gap-2.5 px-6 py-[17px] leading-[14px]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2.5">
            {isLast ? (
              <span className="text-sm leading-[14px] text-[var(--semantic-text-primary)]">{item.label}</span>
            ) : item.to ? (
              <Link to={item.to} className="text-sm leading-[14px] text-[var(--semantic-brand-primary)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm leading-[14px] text-[var(--semantic-brand-primary)]">{item.label}</span>
            )}
            {!isLast && (
              <span
                aria-hidden
                className="inline-block size-3 shrink-0 text-[var(--semantic-brand-primary)]"
                style={{
                  WebkitMaskImage: `url("${iconArrowRight}")`,
                  maskImage: `url("${iconArrowRight}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "currentColor",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
