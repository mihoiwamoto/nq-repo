import { Link } from "react-router-dom";
import { ledgerCategories } from "../../data/ledgers";

export function LedgerCategoryGrid({ basePath }: { basePath: string }) {
  return (
    <div className="flex flex-wrap gap-6 p-6">
      {ledgerCategories.map((category) => (
        <Link
          key={category.slug}
          to={`${basePath}/${category.slug}`}
          className="w-[270px] h-20 bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex items-center gap-2 px-2"
        >
          <img src={category.adminIcon} alt="" className="size-10 shrink-0" />
          <span className="text-base text-[var(--semantic-brand-primary)] text-left flex-1">
            {category.adminLabel}
          </span>
        </Link>
      ))}
    </div>
  );
}
