import { useParams } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { ledgerCategories } from "../../data/ledgers";
import { ComingSoonPage } from "../../pages/ComingSoonPage";

export function AppLedgerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = ledgerCategories.find((item) => item.slug === slug);

  return (
    <>
      <AppHeader title={category?.appLabel ?? "帳票"} />
      <div className="flex-1 overflow-y-auto">
        <ComingSoonPage title={category?.appLabel ?? "帳票"} />
      </div>
    </>
  );
}
