import { Link } from "react-router-dom";
import { visibleLedgerCategories } from "../../data/ledgerVisibility";

export function LedgerCategoryGrid({
  basePath,
  badgeSlugs,
}: {
  basePath: string;
  badgeSlugs?: string[];
}) {
  return (
    // 確定デザイン（Figma 帳票管理 7139:258593・データ検索 7139:259424）どおり 4 列。幅は画面に合わせて 4 等分する
    <div className="grid grid-cols-4 gap-6 p-6">
      {visibleLedgerCategories().map((category) => (
        <Link
          key={category.slug}
          to={`${basePath}/${category.slug}`}
          className="relative min-w-0 h-20 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex items-center gap-2 px-2"
        >
          {badgeSlugs?.includes(category.slug) && (
            <span className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-[var(--semantic-brand-danger)]" />
          )}
          <img src={category.adminIcon} alt="" className="size-10 shrink-0" />
          <span className="text-base text-[var(--semantic-brand-primary)] text-left flex-1">
            {category.adminLabel}
          </span>
        </Link>
      ))}
    </div>
  );
}
