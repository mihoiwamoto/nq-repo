import { Link, useParams } from "react-router-dom";
import { ledgerCategories } from "../../data/ledgers";
import { ComingSoonPage } from "../../pages/ComingSoonPage";
import iconArrowLeft from "../../assets/figma/icons/common/arrow-left.svg";

export function AdminLedgerDetailPage({
  basePath,
  backLabel,
}: {
  basePath: string;
  backLabel: string;
}) {
  const { slug } = useParams<{ slug: string }>();
  const category = ledgerCategories.find((item) => item.slug === slug);

  return (
    <div className="p-6">
      <Link
        to={basePath}
        className="flex items-center gap-1 text-[var(--semantic-brand-primary)] text-sm"
      >
        <span
          aria-hidden
          className="inline-block size-4 shrink-0"
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
        {backLabel}に戻る
      </Link>
      <div className="mt-4">
        <ComingSoonPage title={category?.adminLabel ?? "帳票"} />
      </div>
    </div>
  );
}
