import { Link } from "react-router-dom";
import iconArrowRight from "../../assets/figma/icons/common/arrow-right.svg";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    // data-nq-part は画面説明のコーチマーク（coachMarks.ts）が「パンくず」を見つけるための印。見た目には影響しない
    <div data-nq-part="breadcrumb" className="flex items-center gap-2 px-6 py-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {isLast ? (
              <span className="text-sm text-[var(--semantic-text-primary)]">{item.label}</span>
            ) : item.to ? (
              <Link to={item.to} className="text-sm text-[var(--semantic-brand-primary)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-[var(--semantic-brand-primary)]">{item.label}</span>
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
